export async function sendTelegramMessage(chatId: number | string, text: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  if (!BOT_TOKEN || BOT_TOKEN === 'your_bot_token_here') {
    console.error('TELEGRAM_BOT_TOKEN is missing or placeholder')
    return
  }

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
    
    if (!response.ok) {
      const result = await response.json()
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
    }
  } catch (error) {
    console.error('Telegram sendMessage network error:', error)
  }
}
