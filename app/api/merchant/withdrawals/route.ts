import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = JSON.parse(session.value)
    const { db } = await connectToDatabase()

    const user = await db.collection('User').findOne({ _id: new ObjectId(userData.id) })
    if (!user || !user.merchantId) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const body = await req.json()
    const { type, amountINR, walletAddress, network, bankDetails } = body

    if (!amountINR || amountINR <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const wallet = await db.collection('Wallet').findOne({ merchantId: user.merchantId })
    if (!wallet || wallet.balance < amountINR) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const settings = await db.collection('SystemSettings').findOne({ key: 'global_config' })
    const usdtRate = settings?.usdt_rate || 90
    const minUsdtWd = settings?.min_usdt_withdrawal || 1000

    let withdrawalData: any = {
      merchantId: user.merchantId,
      merchantName: user.name,
      type,
      amountINR: parseFloat(amountINR),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (type === 'usdt') {
      const usdtAmount = amountINR / usdtRate
      if (usdtAmount < minUsdtWd) {
        return NextResponse.json({ error: `Minimum withdrawal is ${minUsdtWd} USDT (approx ₹${minUsdtWd * usdtRate})` }, { status: 400 })
      }
      
      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
      }

      withdrawalData = {
        ...withdrawalData,
        usdtAmount,
        usdtRate,
        walletAddress,
        network: 'TRC20', // Forced TRC20 as per requirement
      }
    } else {
      if (!bankDetails || !bankDetails.accountNumber) {
        return NextResponse.json({ error: 'Bank details are required' }, { status: 400 })
      }
      withdrawalData = {
        ...withdrawalData,
        bankDetails
      }
    }

    // Insert withdrawal request
    const result = await db.collection('Withdrawal').insertOne(withdrawalData)
    const withdrawalId = result.insertedId

    // If INR withdrawal, also create a Transaction for Admin Payout
    if (type === 'inr') {
      const orderNumber = `WDR${Date.now()}${Math.floor(Math.random() * 1000)}`
      await db.collection('Transaction').insertOne({
        orderNumber: orderNumber,
        merchantOrderNumber: orderNumber,
        amount: parseFloat(amountINR),
        merchantId: user.merchantId,
        type: 'PAYOUT',
        status: 'PENDING',
        currency: 'INR',
        bankDetails: {
          account: bankDetails.accountNumber,
          userName: bankDetails.accountHolderName,
          ifsc: bankDetails.ifscCode,
        },
        withdrawalId: withdrawalId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Deduct balance immediately to reserve funds
    await db.collection('Wallet').updateOne(
      { merchantId: user.merchantId },
      { $inc: { balance: -parseFloat(amountINR) }, $set: { updatedAt: new Date() } }
    )

    // Log the transaction
    await db.collection('WalletLog').insertOne({
      merchantId: user.merchantId,
      type: 'DEBIT',
      amount: parseFloat(amountINR),
      previousBalance: wallet.balance,
      newBalance: wallet.balance - parseFloat(amountINR),
      description: `Withdrawal request (${type.toUpperCase()}) - ${result.insertedId}`,
      createdAt: new Date(),
    })

    // Send Telegram Notification
    const merchant = await db.collection('Merchant').findOne({ _id: user.merchantId })
    if (merchant && merchant.telegramChatId) {
      const date = new Date().toLocaleString()
      let message = ""
      
      if (type === 'usdt') {
        const usdtAmount = (parseFloat(amountINR) / usdtRate).toFixed(2)
        message = `🚀 <b>USDT Withdrawal Request</b>\n\n` +
          `📅 <b>Settlement date:</b> ${date}\n` +
          `👤 <b>Merchant ID:</b> ${user.merchantId}\n` +
          `🌍 <b>Country of origin:</b> IND\n` +
          `💰 <b>Settlement amount:</b> ₹${parseFloat(amountINR).toLocaleString()}\n` +
          `📈 <b>Settlement exchange rate:</b> ₹${usdtRate}\n` +
          `🪙 <b>USDT:</b> ${usdtAmount} USDT\n` +
          `🏦 <b>Receiving account:</b> <code>${walletAddress}</code>`
      } else {
        message = `🚀 <b>INR Withdrawal Request</b>\n\n` +
          `📅 <b>Date:</b> ${date}\n` +
          `👤 <b>Merchant ID:</b> ${user.merchantId}\n` +
          `💰 <b>Amount:</b> ₹${parseFloat(amountINR).toLocaleString()}\n` +
          `🏦 <b>Bank:</b> ${bankDetails.bankName}\n` +
          `👤 <b>Account Holder:</b> ${bankDetails.accountHolderName}\n` +
          `🔢 <b>Account Number:</b> <code>${bankDetails.accountNumber}</code>\n` +
          `🏢 <b>IFSC:</b> ${bankDetails.ifscCode}`
      }
      
      await sendTelegramMessage(merchant.telegramChatId, message)
    }

    return NextResponse.json({ message: 'Withdrawal request submitted successfully', id: result.insertedId })
  } catch (error) {
    console.error('Withdrawal request error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = JSON.parse(session.value)
    const { db } = await connectToDatabase()

    const user = await db.collection('User').findOne({ _id: new ObjectId(userData.id) })
    if (!user || !user.merchantId) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const withdrawals = await db.collection('Withdrawal')
      .find({ merchantId: user.merchantId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(withdrawals)
  } catch (error) {
    console.error('Fetch withdrawals error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
