"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ApiDocsPage() {
  const { toast } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const baseUrl = "https://fuzzpay.fuzzgaming.com/api/merchant"

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
      onClick={() => copyToClipboard(text, id)}
    >
      {copiedId === id ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Documentation (Multi-Channel Integration)</h1>
          <p className="text-muted-foreground">FuzzPay provides high availability via Channel 1 and Channel 2 failover</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="basic">Basic & Signature</TabsTrigger>
            <TabsTrigger value="payin">India PayIn (UPI)</TabsTrigger>
            <TabsTrigger value="payout">India PayOut (Bank)</TabsTrigger>
            <TabsTrigger value="gateways">Channel Details</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To integrate with FuzzPay, you must use the following credentials provided in your <strong>Merchant Profile</strong>:
                </p>
                <ul className="list-disc pl-5 text-sm space-y-2">
                  <li><strong>Merchant ID (mchId):</strong> Your unique identifier for all API requests.</li>
                  <li><strong>API Key (Secret Key):</strong> Used to sign your requests and verify callbacks. Keep this strictly confidential.</li>
                </ul>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-400">
                  <strong>Security Note:</strong> Never share your API Key. If compromised, regenerate it immediately from your profile page.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md font-mono text-sm relative group">
                  <code>{baseUrl}</code>
                  <CopyButton text={baseUrl} id="base-url" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Integration Rules (Basic & Signature)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                    <h3 className="font-bold mb-2">Rule 1: Authentication</h3>
                    <p className="text-sm text-muted-foreground">Every request must include your <code>mchId</code> and a valid <code>sign</code>. Authentication is performed via MD5 signature verification using your Secret API Key.</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                    <h3 className="font-bold mb-2">Rule 2: Payload Format</h3>
                    <p className="text-sm text-muted-foreground">The API accepts <code>application/json</code> for requests. All amount fields (money) must be positive numbers or strings representing numbers.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signature Algorithm (MD5)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <p>Standard signature logic for both Merchant API and Gateway callbacks:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sort parameters alphabetically (lexicographical order) by key.</li>
                    <li>Concatenate as <code>key1=value1&key2=value2...</code></li>
                    <li>Empty values ​​do not participate.</li>
                    <li>Append <code>&key=your_api_key</code> to the end.</li>
                    <li>Perform MD5 (32-bit) and convert to <strong>lowercase</strong>.</li>
                  </ul>
                </div>

                <h4 className="font-semibold mt-4">PHP Signature Implementation</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto relative group">
                  <pre>{`<?php
function generateSign($params, $apiKey) {
    ksort($params);
    $tempArr = [];
    foreach ($params as $k => $v) {
        if ($k !== 'sign' && $v !== "" && $v !== null) {
            $tempArr[] = $k . "=" . $v;
        }
    }
    $stringToSign = implode("&", $tempArr) . "&key=" . $apiKey;
    return strtolower(md5($stringToSign));
}

// Example usage for callback verification:
$params = $_POST; // Or json_decode(file_get_contents('php://input'), true);
$receivedSign = $params['sign'];
$calculatedSign = generateSign($params, $apiKey);

if ($receivedSign === $calculatedSign) {
    echo "success";
} else {
    echo "sign error";
}
?>`}</pre>
                  <CopyButton 
                    id="php-sig"
                    text={`<?php
function generateSign($params, $apiKey) {
    ksort($params);
    $tempArr = [];
    foreach ($params as $k => $v) {
        if ($k !== 'sign' && $v !== "" && $v !== null) {
            $tempArr[] = $k . "=" . $v;
        }
    }
    $stringToSign = implode("&", $tempArr) . "&key=" . $apiKey;
    return strtolower(md5($stringToSign));
}
?>`} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gateways Tab */}
          <TabsContent value="gateways" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supported Channels & Failover Logic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">Channel 1 (Primary)</h3>
                      {/* <Badge className="bg-green-500">OkPay</Badge> */}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Our primary gateway with the highest stability and processing speed.</p>
                    <div className="text-xs space-y-1 font-mono">
                      <p>Protocol: HTTP POST</p>
                      <p>Format: Form-urlencoded</p>
                      <p>Callback Response: "success"</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">Channel 2 (Secondary)</h3>
                      {/* <Badge className="bg-blue-500">VeloPay</Badge> */}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Automatic failover channel. Activated if Channel 1 returns an error or times out.</p>
                    <div className="text-xs space-y-1 font-mono">
                      <p>Protocol: HTTP POST</p>
                      <p>Format: JSON</p>
                      <p>Callback Response: "SUCCESS"</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Failover Process
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    FuzzPay uses an <strong>active-passive failover</strong> strategy. When you submit a PayIn request:
                  </p>
                  <ol className="list-decimal pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                    <li>System attempts to create order on <strong>Channel 1</strong>.</li>
                    <li>If Channel 1 is down or busy, system automatically retries on <strong>Channel 2</strong>.</li>
                    <li>The <code>paymentUrl</code> returned to your system will point to the successful gateway.</li>
                    <li>Callbacks will be sent from the gateway that processed the payment.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pay In Tab */}
          <TabsContent value="payin" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">POST</Badge>
                  <CardTitle>Create India PayIn (UPI)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-md font-mono text-sm">/api/merchant/payin</div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Request Parameters</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Parameter</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-left p-2 font-medium">Required</th>
                          <th className="text-left p-2 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-mono">mchId</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Merchant ID provided by FuzzPay</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">money</td>
                          <td className="p-2">Number | String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">PayIn amount in INR (Min: 100, Max: 50,000)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">out_trade_no</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Unique transaction ID from your system</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">notify_url</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Webhook URL for status updates</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">return_url</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Redirection URL after payment</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">sign</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">MD5 signature (see Basic tab)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <h4 className="font-semibold">Request Body Example (JSON)</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto relative group">
                  <pre>{`{
  "mchId": "10001",
  "money": 100,
  "out_trade_no": "TXN_12345",
  "notify_url": "https://callback.com",
  "return_url": "https://return.com",
  "sign": "9e2a3c20067644d6718d02283a005082"
}`}</pre>
                  <CopyButton 
                    id="payin-json"
                    text={`{
  "mchId": "10001",
  "money": 100,
  "out_trade_no": "TXN_12345",
  "notify_url": "https://callback.com",
  "return_url": "https://return.com",
  "sign": "9e2a3c20067644d6718d02283a005082"
}`} 
                  />
                </div>

                <h4 className="font-semibold mt-4">PHP Implementation (Full Example)</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto relative group">
                  <pre>{`<?php
$apiKey = "YOUR_API_KEY"; // Your Merchant Secret Key
$apiUrl = "${baseUrl}/payin";

$params = [
    "mchId"        => "10001",
    "money"        => "100",
    "out_trade_no" => "TXN_" . time(),
    "notify_url"   => "https://your-domain.com/callback",
    "return_url"   => "https://your-domain.com/success",
];

// 1. Generate Signature
ksort($params);
$tempArr = [];
foreach ($params as $k => $v) {
    if ($k !== 'sign' && $v !== "" && $v !== null) $tempArr[] = $k . "=" . $v;
}
$sign = strtolower(md5(implode("&", $tempArr) . "&key=" . $apiKey));
$params["sign"] = $sign;

// 2. Send POST Request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// 3. Handle Response
$result = json_decode($response, true);
if ($result && $result['code'] === 0) {
    $paymentUrl = $result['data']['url'];
    header("Location: " . $paymentUrl);
    exit;
} else {
    echo "Error: " . ($result['msg'] ?? 'Connection failed');
}
?>`}</pre>
                  <CopyButton 
                    id="payin-php"
                    text={`<?php
$apiKey = "YOUR_API_KEY"; // Your Merchant Secret Key
$apiUrl = "${baseUrl}/payin";

$params = [
    "mchId"        => "10001",
    "money"        => "100",
    "out_trade_no" => "TXN_" . time(),
    "notify_url"   => "https://your-domain.com/callback",
    "return_url"   => "https://your-domain.com/success",
];

// 1. Generate Signature
ksort($params);
$tempArr = [];
foreach ($params as $k => $v) {
    if ($k !== 'sign' && $v !== "" && $v !== null) $tempArr[] = $k . "=" . $v;
}
$sign = strtolower(md5(implode("&", $tempArr) . "&key=" . $apiKey));
$params["sign"] = $sign;

// 2. Send POST Request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// 3. Handle Response
$result = json_decode($response, true);
if ($result && $result['code'] === 0) {
    $paymentUrl = $result['data']['url'];
    header("Location: " . $paymentUrl);
    exit;
} else {
    echo "Error: " . ($result['msg'] ?? 'Connection failed');
}
?>`} 
                  />
                </div>
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-blue-500">CALLBACK</Badge>
                    <CardTitle className="text-lg">PayIn Callback Notification</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    When a payment is completed, FuzzPay will send a POST request to your <code>notify_url</code>. 
                    The request will be <code>application/x-www-form-urlencoded</code> (Channel 1) or <code>application/json</code> (Channel 2).
                    Your server must return the string <code>success</code> or <code>SUCCESS</code> to acknowledge receipt.
                  </p>

                  <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-md border border-yellow-200 dark:border-yellow-800 mb-6">
                    <h5 className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-1">Failover Handling Tip:</h5>
                    <p className="text-xs text-yellow-700 dark:text-yellow-500">
                      Since FuzzPay uses multi-channel failover, we recommend your callback endpoint accepts both <strong>Form Data</strong> and <strong>JSON</strong> bodies, and treats the <code>sign</code> verification as the source of truth.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Callback Parameters</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Parameter</th>
                            <th className="text-left p-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2 font-mono">mchId</td>
                            <td className="p-2">Merchant ID</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">out_trade_no</td>
                            <td className="p-2">Your system's unique transaction ID</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">currency</td>
                            <td className="p-2">Currency code (INR)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">money</td>
                            <td className="p-2">Original order amount</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">pay_money</td>
                            <td className="p-2 text-green-600 font-semibold">Actual amount paid by customer</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">real_money</td>
                            <td className="p-2">Net revenue after fees</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">status</td>
                            <td className="p-2">Order status (1 = Success, 2 = Failed)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">attach</td>
                            <td className="p-2">Additional data passed during creation</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">sign</td>
                            <td className="p-2">Signature for verification</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="font-semibold text-sm">Example Callback (Form Data)</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto relative group">
                      <pre>{`mchId=1000&out_trade_no=TXN_12345&currency=INR&money=500&pay_money=500&status=1&sign=...`}</pre>
                      <CopyButton 
                        id="payin-callback"
                        text={`mchId=1000&out_trade_no=TXN_12345&currency=INR&money=500&pay_money=500&status=1&sign=...`} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pay Out Tab */}
          <TabsContent value="payout" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">POST</Badge>
                  <CardTitle>Create India PayOut (Bank)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-md font-mono text-sm">/api/merchant/payout</div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Request Parameters</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Parameter</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-left p-2 font-medium">Required</th>
                          <th className="text-left p-2 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-mono">mchId</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Merchant ID provided by FuzzPay</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">money</td>
                          <td className="p-2">Number</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Payout amount in INR</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">out_trade_no</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Unique transaction ID from your system</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">account</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Bank account number</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">userName</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Account holder name</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">ifsc</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Bank IFSC code</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-mono">notify_url</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">Webhook URL for status updates</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">sign</td>
                          <td className="p-2">String</td>
                          <td className="p-2">Yes</td>
                          <td className="p-2">MD5 signature (see Basic tab)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <h4 className="font-semibold">Request Body Example (JSON)</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto relative group">
                  <pre>{`{
  "mchId": "10001",
  "money": 500,
  "out_trade_no": "PO_12345",
  "account": "910123456789",
  "userName": "John Doe",
  "ifsc": "SBIN0001234",
  "notify_url": "https://callback.com",
  "sign": "5d41402abc4b2a76b9719d911017c592"
}`}</pre>
                  <CopyButton 
                    id="payout-json"
                    text={`{
  "mchId": "10001",
  "money": 500,
  "out_trade_no": "PO_12345",
  "account": "910123456789",
  "userName": "John Doe",
  "ifsc": "SBIN0001234",
  "notify_url": "https://callback.com",
  "sign": "5d41402abc4b2a76b9719d911017c592"
}`} 
                  />
                </div>

                <h4 className="font-semibold mt-4">PHP Implementation (Full Example)</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto relative group">
                  <pre>{`<?php
$apiKey = "YOUR_API_KEY"; // Your Merchant Secret Key
$apiUrl = "${baseUrl}/payout";

$params = [
    "mchId"        => "10001",
    "money"        => 500,
    "out_trade_no" => "PO_" . time(),
    "account"      => "910123456789",
    "userName"     => "John Doe",
    "ifsc"         => "SBIN0001234",
    "notify_url"   => "https://your-domain.com/payout-callback",
];

// 1. Generate Signature
ksort($params);
$tempArr = [];
foreach ($params as $k => $v) {
    if ($k !== 'sign' && $v !== "" && $v !== null) $tempArr[] = $k . "=" . $v;
}
$sign = strtolower(md5(implode("&", $tempArr) . "&key=" . $apiKey));
$params["sign"] = $sign;

// 2. Send POST Request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// 3. Handle Response
$result = json_decode($response, true);
if ($result && $result['code'] === 0) {
    echo "Payout Initiated. Transaction ID: " . $result['data']['transaction_Id'];
} else {
    echo "Error: " . ($result['msg'] ?? 'Connection failed');
}
?>`}</pre>
                  <CopyButton 
                    id="payout-php"
                    text={`<?php
$apiKey = "YOUR_API_KEY"; // Your Merchant Secret Key
$apiUrl = "${baseUrl}/payout";

$params = [
    "mchId"        => "10001",
    "money"        => 500,
    "out_trade_no" => "PO_" . time(),
    "account"      => "910123456789",
    "userName"     => "John Doe",
    "ifsc"         => "SBIN0001234",
    "notify_url"   => "https://your-domain.com/payout-callback",
];

// 1. Generate Signature
ksort($params);
$tempArr = [];
foreach ($params as $k => $v) {
    if ($k !== 'sign' && $v !== "" && $v !== null) $tempArr[] = $k . "=" . $v;
}
$sign = strtolower(md5(implode("&", $tempArr) . "&key=" . $apiKey));
$params["sign"] = $sign;

// 2. Send POST Request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// 3. Handle Response
$result = json_decode($response, true);
if ($result && $result['code'] === 0) {
    echo "Payout Initiated. Transaction ID: " . $result['data']['transaction_Id'];
} else {
    echo "Error: " . ($result['msg'] ?? 'Connection failed');
}
?>`} 
                  />
                </div>
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-blue-500">CALLBACK</Badge>
                    <CardTitle className="text-lg">PayOut Callback Notification</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    When a payout is processed, FuzzPay will send a POST request to your <code>notify_url</code>. 
                    The request will be <code>application/x-www-form-urlencoded</code>. 
                    Your server must return the string <code>success</code> to acknowledge receipt.
                  </p>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Callback Parameters</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Parameter</th>
                            <th className="text-left p-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2 font-mono">mchId</td>
                            <td className="p-2">Merchant ID</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">out_trade_no</td>
                            <td className="p-2">Your system's unique transaction ID</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">money</td>
                            <td className="p-2">Payout amount</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">status</td>
                            <td className="p-2">Order status (1 = Success, 2 = Failed)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-mono">attach</td>
                            <td className="p-2">Additional data passed during creation</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">sign</td>
                            <td className="p-2">Signature for verification</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="font-semibold text-sm">Example Callback (Form Data)</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto relative group">
                      <pre>{`mchId=1000&out_trade_no=PO_12345&money=500&status=1&sign=...`}</pre>
                      <CopyButton 
                        id="payout-callback"
                        text={`mchId=1000&out_trade_no=PO_12345&money=500&status=1&sign=...`} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
