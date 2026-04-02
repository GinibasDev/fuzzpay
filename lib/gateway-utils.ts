import crypto from 'crypto'

export function generateSignature(params: Record<string, any>, privateKey: string, uppercase = false): string {
  // 1. Sort parameters lexicographically by key
  const sortedKeys = Object.keys(params).sort()

  // 2. Concatenate as key1=value1&key2=value2...
  // Pay special attention to:
  // - Empty values do not participate in the signature
  // - The "sign" parameter itself does not participate
  const stringA = sortedKeys
    .filter((key) => {
      const value = params[key]
      return key !== 'sign' && value !== undefined && value !== null && value.toString().trim() !== ''
    })
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  // 3. Append the private key
  const stringSignTemp = `${stringA}&key=${privateKey}`
  console.log('Signature string:', stringSignTemp)

  // 4. MD5 hash
  const sign = crypto.createHash('md5').update(stringSignTemp).digest('hex')
  return uppercase ? sign.toUpperCase() : sign.toLowerCase()
}

export function verifySignature(params: Record<string, any>, privateKey: string, receivedSign: string): boolean {
  if (!receivedSign) return false
  const { sign, ...paramsWithoutSign } = params
  
  // Try both uppercase and lowercase if not sure, or detect from receivedSign
  const isReceivedUppercase = receivedSign === receivedSign.toUpperCase() && receivedSign !== receivedSign.toLowerCase()
  
  const generatedSign = generateSignature(paramsWithoutSign, privateKey, isReceivedUppercase)
  const isMatch = generatedSign === receivedSign.trim() || 
                  generateSignature(paramsWithoutSign, privateKey, !isReceivedUppercase) === receivedSign.trim()
  
  if (!isMatch) {
    console.log('Signature mismatch details:', {
      expected: generatedSign,
      received: receivedSign,
      keyUsed: privateKey
    })
  }
  
  return isMatch
}

// Gateway Initiation Types
export interface PayInData {
  mchId: string
  amount: number
  orderNumber: string
  notifyUrl: string
  returnUrl: string
  internalId: string
}

export async function initiateOkPayPayIn(data: PayInData) {
  const params: Record<string, string> = {
    mchId: process.env.OKPAY_MCH_ID || '2637',
    currency: 'INR',
    out_trade_no: data.orderNumber,
    pay_type: 'UPI',
    money: data.amount.toString(),
    attach: data.internalId,
    notify_url: data.notifyUrl,
    returnUrl: data.returnUrl,
  }
  params.sign = generateSignature(params, process.env.OKPAY_KEY || '009c69aaaafc468e889db30a71b0a5d9', false)

  const formData = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value)
  }

  const host = process.env.OKPAY_HOST || 'api.wpay.one'
  const response = await fetch(`https://${host}/v1/Collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })
  const resData = await response.json()
  console.log('OkPay Response:', resData)
  return resData
}

export async function initiateVeloPayPayIn(data: PayInData) {
  const params: Record<string, any> = {
    merchant_no: process.env.VELOPAY_MCH_ID || '554',
    txn_id: data.orderNumber,
    amount: data.amount.toString(),
    type: 1, // Default H5
    callback: data.notifyUrl,
    currency: 'INR',
  }
  params.sign = generateSignature(params, process.env.VELOPAY_KEY || '1c639bd1bb094de8aa256dcc285bd05e', false)

  const response = await fetch('https://velopay.ptasm.online/api/payin/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const resData = await response.json()
  console.log('VeloPay Response:', resData)
  return resData
}

export interface PayOutData extends PayInData {
  account: string
  userName: string
  ifsc: string
}

export async function initiateOkPayPayOut(data: PayOutData) {
  const params: Record<string, string> = {
    mchId: process.env.OKPAY_MCH_ID || '2637',
    currency: 'INR',
    out_trade_no: data.orderNumber,
    pay_type: 'BANK',
    account: data.account,
    userName: data.userName,
    money: data.amount.toString(),
    attach: data.internalId,
    notify_url: data.notifyUrl,
    reserve1: `ifsc${data.ifsc}`,
  }
  params.sign = generateSignature(params, process.env.OKPAY_KEY || '009c69aaaafc468e889db30a71b0a5d9', false)

  const formData = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value)
  }

  const host = process.env.OKPAY_HOST || 'api.wpay.one'
  const response = await fetch(`https://${host}/v1/Payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })
  return await response.json()
}

export async function initiateVeloPayPayOut(data: PayOutData) {
  const params: Record<string, any> = {
    merchant_no: process.env.VELOPAY_MCH_ID || '554',
    txn_id: data.orderNumber,
    amount: data.amount.toString(),
    type: 1,
    ifsc: data.ifsc,
    card_num: data.account,
    name: data.userName,
    callback: data.notifyUrl,
    currency: 'INR',
  }
  params.sign = generateSignature(params, process.env.VELOPAY_KEY || '1c639bd1bb094de8aa256dcc285bd05e', false)

  const response = await fetch('https://velopay.ptasm.online/api/payout/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return await response.json()
}

export async function initiatePayInFailover(data: PayInData) {
  let result: any
  let gatewayUsed = 'OKPAY'

  try {
    // Try OkPay first (Priority)
    result = await initiateOkPayPayIn(data)
    if (result.code !== 0) throw new Error(result.msg || 'OkPay failed')
    return { success: true, gateway: 'OKPAY', result }
  } catch (error) {
    console.warn('OkPay failed, switching to VeloPay:', error)
    try {
      gatewayUsed = 'VELOPAY'
      result = await initiateVeloPayPayIn(data)
      if (result.status !== 'SUCCESS') throw new Error(result.message || 'VeloPay failed')
      return { success: true, gateway: 'VELOPAY', result }
    } catch (veloError: any) {
      console.error('All gateways failed')
      return { success: false, error: 'All gateways failed' }
    }
  }
}

export async function initiatePayOutFailover(data: PayOutData) {
  let result: any
  let gatewayUsed = 'OKPAY'

  try {
    // Try OkPay first (Priority)
    result = await initiateOkPayPayOut(data)
    if (result.code !== 0) throw new Error(result.msg || 'OkPay failed')
    return { success: true, gateway: 'OKPAY', result }
  } catch (error) {
    console.warn('OkPay failed, switching to VeloPay:', error)
    try {
      gatewayUsed = 'VELOPAY'
      result = await initiateVeloPayPayOut(data)
      if (result.status !== 'PENDING' && result.status !== 'SUCCESS') throw new Error(result.message || 'VeloPay failed')
      return { success: true, gateway: 'VELOPAY', result }
    } catch (veloError: any) {
      console.error('All gateways failed')
      return { success: false, error: 'All gateways failed' }
    }
  }
}
