import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

async function sendMessage(chatId: number | string, text: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  console.log(`Sending message to ${chatId}: ${text.substring(0, 50)}...`)
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      console.error('Telegram sendMessage failed:', JSON.stringify(result))
      // Fallback: send as plain text if HTML fails
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.replace(/<[^>]*>/g, ''), // Strip HTML tags
        }),
      })
    } else {
      console.log(`Message sent successfully to ${chatId}`)
    }
  } catch (error) {
    console.error('Telegram sendMessage network error:', error)
  }
}

export async function POST(req: NextRequest) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  try {
    const body = await req.json()
    console.log('Telegram Webhook Payload:', JSON.stringify(body))

    if (!BOT_TOKEN || BOT_TOKEN === 'your_bot_token_here') {
      console.error('TELEGRAM_BOT_TOKEN is missing or placeholder')
      return NextResponse.json({ ok: true })
    }

    const message = body.message || body.edited_message || body.channel_post
    if (!message || !message.text) {
      console.log('No message text found in payload')
      return NextResponse.json({ ok: true })
    }

    const { chat, text } = message
    const chatId = chat.id
    const isGroup = chat.type === 'group' || chat.type === 'supergroup'
    
    console.log(`Payload Type: ${chat.type}, Chat ID: ${chatId}`)

    // Handle bot being added to a group
    if (message.new_chat_member && message.new_chat_member.is_bot) {
      // Check if it's this bot (id: 8144526002)
      if (message.new_chat_member.id.toString().startsWith('8144')) {
        await sendMessage(chatId, "👋 <b>Fuzzpay Bot joined the group!</b>\n\nTo start managing your gateway here, use:\n<code>/bind &lt;merchant_id&gt;</code>")
        return NextResponse.json({ ok: true })
      }
    }

    if (!text) return NextResponse.json({ ok: true })

    // Improved command parsing
    const tokens = text.trim().split(/\s+/)
    const rawCommand = tokens[0].toLowerCase()
    const command = rawCommand.split('@')[0]
    const args = tokens.slice(1)

    console.log(`Processing command: ${command} in chat: ${chatId} (${chat.type})`)

    const { db } = await connectToDatabase()

    // Find merchant linked to this chat - support both string and number formats
    const merchant = await db.collection('Merchant').findOne({ 
      $or: [
        { telegramChatId: chatId.toString() },
        { telegramChatId: chatId }
      ]
    })

    console.log(`Merchant found for chat ${chatId}:`, merchant ? merchant.name : 'None')

    // Check if command requires a group
    const merchantCommands = ['/b', '/check', '/in', '/out', '/rein', '/reout', '/ratio', '/status', '/report']
    if (merchantCommands.includes(command) && !isGroup) {
      await sendMessage(chatId, "❌ <b>Merchant commands are only available in group chats.</b>\n\nPlease add this bot to your merchant group and bind it.")
      return NextResponse.json({ ok: true })
    }

    // Command handling
    switch (command) {
      case '/start':
        await sendMessage(chatId, `👋 <b>Welcome to Fuzzpay Bot!</b>\n\nYour Chat ID: <code>${chatId}</code>\nChat Type: <b>${chat.type}</b>\n\nUse /h to see available commands.`)
        break
      case '/h':
        await handleHelp(chatId)
        break
      case '/ping':
        await sendMessage(chatId, "🏓 Pong!")
        break

      case '/bind':
        await handleBind(chatId, args, db)
        break

      case '/b':
        if (!merchant) {
          await sendNotBound(chatId)
          break
        }
        await handleBalance(chatId, merchant, db)
        break

      case '/check':
        if (!merchant) {
          await sendNotBound(chatId)
          break
        }
        await handleCheck(chatId, merchant, db)
        break

      case '/in':
      case '/out':
        if (!merchant) {
          await sendNotBound(chatId)
          break
        }
        await handleOrderStatus(chatId, merchant, db, command === '/in' ? 'PAYIN' : 'PAYOUT', args[0])
        break

      case '/rein':
      case '/reout':
        if (!merchant) {
          await sendNotBound(chatId)
          break
        }
        await handleCallback(chatId, merchant, db, command === '/rein' ? 'PAYIN' : 'PAYOUT', args[0])
        break

      case '/ratio':
        if (!merchant) {
          await sendNotBound(chatId)
          break
        }
        await handleRatio(chatId, merchant, db)
        break

      case '/report':
        if (!merchant) {
          await sendNotBound(chatId)
          break
        }
        await handleReport(chatId, merchant, db)
        break

      case '/status':
        if (!merchant) {
          await sendMessage(chatId, `⚠️ This chat is <b>not bound</b> to any merchant.\nChat ID: <code>${chatId}</code>\n\nUse <code>/bind &lt;merchant_id&gt;</code> to link it.`)
          break
        }
        await sendMessage(chatId, `✅ This chat is bound to Merchant: <b>${merchant.name}</b> (<code>${merchant._id}</code>)\nChat ID: <code>${chatId}</code>`)
        break

      default:
        console.log(`Unknown command or message: ${command}`)
        break
    }

    console.log(`Webhook processing completed for chat ${chatId}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram Webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

async function handleHelp(chatId: number) {
  const helpText = `💎 <b>Fuzzpay Bot Command Guide</b> 💎

▌📋 <b>Full Command List</b>
• <code>/h</code> — Get all commands
• <code>/b</code> — Check balance
• <code>/report</code> — Detailed daily report
• <code>/check</code> — Today's transaction overview
• <code>/in</code> — Check collection order status
• <code>/out</code> — Check payment order status
• <code>/rein</code> — Initiate collection order callback
• <code>/reout</code> — Initiate payment order callback
• <code>/ratio</code> — Get success rate

▌📚 <b>Command Usage Instructions</b>
• Collection order query: <code>/in order_number</code>
• Payment order query: <code>/out order_number</code>
• Initiate collection callback: <code>/rein order_number</code>
• Initiate payment callback: <code>/reout order_number</code>

▌🔑 <b>Setup</b>
• Bind merchant: <code>/bind merchant_id</code>
• Check binding: <code>/status</code>`
  await sendMessage(chatId, helpText)
}

async function handleBind(chatId: number, args: string[], db: any) {
  if (args.length === 0) {
    return await sendMessage(chatId, "❌ Usage: <code>/bind &lt;merchant_id&gt;</code>")
  }

  const merchantIdStr = args[0]
  console.log(`Attempting to bind chat ${chatId} to merchant ${merchantIdStr}`)

  try {
    // 1. Validate ObjectId
    if (!ObjectId.isValid(merchantIdStr)) {
      return await sendMessage(chatId, "❌ Invalid merchant ID format.")
    }

    // 2. Find merchant
    const merchant = await db.collection('Merchant').findOne({ _id: new ObjectId(merchantIdStr) })
    if (!merchant) {
      return await sendMessage(chatId, "❌ Merchant not found.")
    }

    // 3. Remove this chatId from ANY other merchant first to prevent multiple bindings
    await db.collection('Merchant').updateMany(
      { 
        $or: [
          { telegramChatId: chatId.toString() },
          { telegramChatId: chatId }
        ]
      },
      { $unset: { telegramChatId: "" } }
    )

    // 4. Bind to new merchant
    await db.collection('Merchant').updateOne(
      { _id: new ObjectId(merchantIdStr) },
      { $set: { telegramChatId: chatId.toString(), updatedAt: new Date() } }
    )

    console.log(`Successfully bound chat ${chatId} to merchant: ${merchant.name}`)
    await sendMessage(chatId, `✅ Successfully bound to merchant: <b>${merchant.name}</b>`)
  } catch (e: any) {
    console.error('Bind error:', e)
    await sendMessage(chatId, `❌ Error during binding: ${e.message}`)
  }
}

async function handleBalance(chatId: number, merchant: any, db: any) {
  const wallet = await db.collection('Wallet').findOne({ merchantId: merchant._id })
  const balance = wallet ? wallet.balance : 0
  await sendMessage(chatId, `💰 <b>Balance Overview</b>\n\nMerchant: <b>${merchant.name}</b>\nCurrent Balance: <code>₹${balance.toFixed(2)}</code>`)
}

async function handleCheck(chatId: number, merchant: any, db: any) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = await db.collection('Transaction').aggregate([
    { 
      $match: { 
        merchantId: merchant._id,
        createdAt: { $gte: today }
      } 
    },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
        successAmount: { 
          $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, "$amount", 0] } 
        },
        count: { $sum: 1 },
        successCount: { 
          $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] } 
        }
      }
    }
  ]).toArray()

  let message = `📊 <b>Today's Overview</b> (${today.toLocaleDateString()})\n\n`
  
  const payin = stats.find((s: any) => s._id === 'PAYIN') || { totalAmount: 0, successAmount: 0, count: 0, successCount: 0 }
  const payout = stats.find((s: any) => s._id === 'PAYOUT') || { totalAmount: 0, successAmount: 0, count: 0, successCount: 0 }

  message += `📥 <b>Collections (Payin)</b>\n`
  message += `• Total: <code>₹${payin.totalAmount.toFixed(2)}</code> (${payin.count})\n`
  message += `• Success: <code>₹${payin.successAmount.toFixed(2)}</code> (${payin.successCount})\n\n`

  message += `📤 <b>Payments (Payout)</b>\n`
  message += `• Total: <code>₹${payout.totalAmount.toFixed(2)}</code> (${payout.count})\n`
  message += `• Success: <code>₹${payout.successAmount.toFixed(2)}</code> (${payout.successCount})`

  await sendMessage(chatId, message)
}

async function handleOrderStatus(chatId: number, merchant: any, db: any, type: string, orderNumber: string) {
  if (!orderNumber) {
    return await sendMessage(chatId, `❌ Usage: <code>/${type === 'PAYIN' ? 'in' : 'out'} &lt;order_number&gt;</code>`)
  }

  const tx = await db.collection('Transaction').findOne({ 
    merchantId: merchant._id,
    type: type,
    orderNumber: orderNumber
  })

  if (!tx) {
    return await sendMessage(chatId, `❌ Order not found: <code>${orderNumber}</code>`)
  }

  const statusEmoji = tx.status === 'SUCCESS' ? '✅' : tx.status === 'FAILED' ? '❌' : '⏳'
  let message = `${statusEmoji} <b>Order Details</b>\n\n`
  message += `• Order No: <code>${tx.orderNumber}</code>\n`
  message += `• Amount: <code>₹${tx.amount.toFixed(2)}</code>\n`
  message += `• Status: <b>${tx.status}</b>\n`
  message += `• Type: <b>${tx.type}</b>\n`
  message += `• Time: <code>${tx.createdAt.toLocaleString()}</code>`

  await sendMessage(chatId, message)
}

async function handleCallback(chatId: number, merchant: any, db: any, type: string, orderNumber: string) {
  if (!orderNumber) {
    return await sendMessage(chatId, `❌ Usage: <code>/${type === 'PAYIN' ? 'rein' : 'reout'} &lt;order_number&gt;</code>`)
  }

  const tx = await db.collection('Transaction').findOne({ 
    merchantId: merchant._id,
    type: type,
    orderNumber: orderNumber
  })

  if (!tx) {
    return await sendMessage(chatId, `❌ Order not found: <code>${orderNumber}</code>`)
  }

  if (!tx.notify_url) {
    return await sendMessage(chatId, `❌ No notification URL found for this order.`)
  }

  // Simulate callback initiation
  // In a real app, you'd trigger your notification service here
  await sendMessage(chatId, `🔄 Initiating callback for order <code>${orderNumber}</code>...\nTarget: <code>${tx.notify_url}</code>`)
  
  try {
    const response = await fetch(tx.notify_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: tx.orderNumber,
        amount: tx.amount,
        status: tx.status,
        type: tx.type,
        timestamp: new Date().toISOString()
      }),
      // Set a short timeout
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      await sendMessage(chatId, `✅ Callback successful! Status: ${response.status}`)
    } else {
      await sendMessage(chatId, `⚠️ Callback returned status: ${response.status}`)
    }
  } catch (error: any) {
    await sendMessage(chatId, `❌ Callback failed: ${error.message}`)
  }
}

async function handleRatio(chatId: number, merchant: any, db: any) {
  const stats = await db.collection('Transaction').aggregate([
    { 
      $match: { 
        merchantId: merchant._id
      } 
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: 1 },
        success: { 
          $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] } 
        }
      }
    }
  ]).toArray()

  let message = `📈 <b>Success Rate Analysis</b>\n\n`
  
  stats.forEach((s: any) => {
    const ratio = s.total > 0 ? (s.success / s.total) * 100 : 0
    message += `<b>${s._id}</b>\n`
    message += `• Success: ${s.success} / ${s.total}\n`
    message += `• Rate: <code>${ratio.toFixed(2)}%</code>\n\n`
  })

  if (stats.length === 0) {
    message += "No transaction data available."
  }

  await sendMessage(chatId, message)
}

async function handleReport(chatId: number, merchant: any, db: any) {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000)
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000)

  // 1. Get Wallet Balance
  const wallet = await db.collection('Wallet').findOne({ merchantId: merchant._id })
  const balance = wallet ? wallet.balance : 0

  // 2. Optimized Aggregation: Get all stats in one pass
  const stats = await db.collection('Transaction').aggregate([
    { 
      $match: { 
        merchantId: merchant._id,
        createdAt: { $gte: today }
      } 
    },
    {
      $group: {
        _id: null,
        // Today's stats
        payinSuccessCount: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "PAYIN"] }, { $eq: ["$status", "SUCCESS"] }] }, 1, 0] } },
        payinSuccessAmount: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "PAYIN"] }, { $eq: ["$status", "SUCCESS"] }] }, "$amount", 0] } },
        payoutSuccessCount: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "PAYOUT"] }, { $eq: ["$status", "SUCCESS"] }] }, 1, 0] } },
        payoutSuccessAmount: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "PAYOUT"] }, { $eq: ["$status", "SUCCESS"] }] }, "$amount", 0] } },
        payoutPendingCount: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "PAYOUT"] }, { $eq: ["$status", "PENDING"] }] }, 1, 0] } },
        payoutPendingAmount: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "PAYOUT"] }, { $eq: ["$status", "PENDING"] }] }, "$amount", 0] } },
        
        // 10m stats
        total10m: { $sum: { $cond: [{ $gte: ["$createdAt", tenMinsAgo] }, 1, 0] } },
        success10m: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", tenMinsAgo] }, { $eq: ["$status", "SUCCESS"] }] }, 1, 0] } },
        
        // 30m stats
        total30m: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyMinsAgo] }, 1, 0] } },
        success30m: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", thirtyMinsAgo] }, { $eq: ["$status", "SUCCESS"] }] }, 1, 0] } }
      }
    }
  ]).next()

  const s = stats || {
    payinSuccessCount: 0, payinSuccessAmount: 0,
    payoutSuccessCount: 0, payoutSuccessAmount: 0,
    payoutPendingCount: 0, payoutPendingAmount: 0,
    total10m: 0, success10m: 0,
    total30m: 0, success30m: 0
  }

  // Fees calculation
  const payinFeeRate = (merchant.payinRate || 0) / 100
  const payoutFeeRate = (merchant.payoutRate || 0) / 100
  const payinFee = s.payinSuccessAmount * payinFeeRate
  const payoutFee = s.payoutSuccessAmount * payoutFeeRate

  const rate10m = s.total10m > 0 ? (s.success10m / s.total10m * 100).toFixed(0) : "0"
  const rate30m = s.total30m > 0 ? (s.success30m / s.total30m * 100).toFixed(0) : "0"

  // 4. Construct Message
  let message = `Merchant data today\n`
  message += `-----INR（${merchant.name}）-----\n`
  message += `1、Payin Report(Successful Order)\n`
  message += `Total Number:${s.payinSuccessCount}\n`
  message += `Total Amount:${s.payinSuccessAmount.toFixed(2)}\n`
  message += `Fee:${payinFee.toFixed(2)}\n`
  
  message += `2、Payout Report(Successful Order)\n`
  message += `Total Number:${s.payoutSuccessCount}\n`
  message += `Total Amount:${s.payoutSuccessAmount.toFixed(2)}\n`
  message += `Fee:${payoutFee.toFixed(2)}\n`
  message += `Pending Number:${s.payoutPendingCount}\n`
  message += `Pending Amount:${s.payoutPendingAmount.toFixed(2)}\n\n`
  
  message += `Current balance:${balance.toFixed(2)}\n\n`
  
  message += `Success rate in 10 minutes\n`
  message += `Request quantity：${s.total10m}\n`
  message += `Success number：${s.success10m}\n`
  message += `Success rate：${rate10m}%\n\n`
  
  message += `Success rate in 30 minutes\n`
  message += `Request quantity：${s.total30m}\n`
  message += `Success number：${s.success30m}\n`
  message += `Success rate：${rate30m}%\n\n`
  
  message += `Data statistics are based on the order creation time`

  await sendMessage(chatId, message)
}

async function sendNotBound(chatId: number) {
  await sendMessage(chatId, "⚠️ This group/chat is not bound to any merchant.\nUse <code>/bind &lt;merchant_id&gt;</code> to link it.")
}
