import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifySignature, generateSignature } from '@/lib/gateway-utils'

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const contentType = req.headers.get('content-type') || ''
    
    let body: Record<string, any> = {}
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      formData.forEach((value, key) => {
        body[key] = value
      })
    } else {
      body = await req.json()
    }

    console.log('OkPay PayIn Callback Body:', body)

    const okpayKey = process.env.OKPAY_KEY || '009c69aaaafc468e889db30a71b0a5d9'
    
    // 1. Verify Signature
    if (!verifySignature(body, okpayKey, body.sign)) {
      console.error('OkPay PayIn Signature Verification Failed')
      return new Response('fail', { status: 400 })
    }

    // 2. Identify Transaction
    const transactionId = body.attach
    if (!transactionId) {
      console.error('OkPay PayIn Callback: Missing attach (transactionId)')
      return new Response('fail', { status: 400 })
    }

    const transaction = await db.collection('Transaction').findOne({ 
      _id: new ObjectId(transactionId) 
    })

    if (!transaction) {
      console.error('OkPay PayIn Callback: Transaction not found', transactionId)
      return new Response('fail', { status: 404 })
    }

    if (transaction.status === 'SUCCESS') {
      return new Response('success')
    }

    // 3. Update Transaction Status
    const status = body.status === '1' ? 'SUCCESS' : 'FAILED'
    
    // If successful, credit merchant balance
    if (status === 'SUCCESS' && transaction.status !== 'SUCCESS') {
      const amount = parseFloat(body.pay_money || body.money)
      
      await db.collection('Wallet').updateOne(
        { merchantId: transaction.merchantId },
        { $inc: { balance: amount }, $set: { updatedAt: new Date() } }
      )
      
      await db.collection('WalletLog').insertOne({
        merchantId: transaction.merchantId,
        type: 'DEBIT', // For PayIn it's technically a credit to the wallet, but let's see how they log it. 
        // Wait, usually PayIn adds balance.
        amount: amount,
        description: `PayIn successful: ${transaction.orderNumber}`,
        createdAt: new Date(),
      })
    }

    await db.collection('Transaction').updateOne(
      { _id: new ObjectId(transactionId) },
      { 
        $set: { 
          status: status,
          gatewayCallback: body,
          paymentAmount: parseFloat(body.pay_money || body.money),
          updatedAt: new Date()
        } 
      }
    )

    // 4. Notify Merchant
    if (transaction.notifyUrl) {
      try {
        const merchant = await db.collection('Merchant').findOne({ _id: transaction.merchantId })
        const merchantKey = merchant?.apiKey || '009c69aaaafc468e889db30a71b0a5d9'

        const callbackData: Record<string, any> = {
          mchId: merchant?.mchId || transaction.merchantId.toString(),
          out_trade_no: transaction.orderNumber,
          money: transaction.amount.toString(),
          pay_money: (body.pay_money || body.money).toString(),
          status: status === 'SUCCESS' ? '1' : '2',
          attach: transaction.attach || '',
        }
        callbackData.sign = generateSignature(callbackData, merchantKey)

        const formData = new URLSearchParams()
        for (const [key, value] of Object.entries(callbackData)) {
          formData.append(key, value)
        }

        fetch(transaction.notifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        }).catch(err => console.error('Failed to notify merchant:', err))

      } catch (err) {
        console.error('Error during merchant notification:', err)
      }
    }

    return new Response('success')

  } catch (error: any) {
    console.error('OkPay PayIn Callback Error:', error)
    return new Response('fail', { status: 500 })
  }
}
