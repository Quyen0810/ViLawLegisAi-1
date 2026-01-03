'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BrowserProvider, JsonRpcProvider, parseEther } from 'ethers'


const DEFAULT_PAYMENT_ADDRESS = '{process.env.REACT_APP_ACCOUNT}'
const INFURA_MAINNET_RPC = '{process.env.REACT_APP_RPC_HTTP_URL}'

type PackageName = 'Gov' | 'Edu' | 'Pro'

const PACKAGE_PRICES_ETH: Record<Exclude<PackageName, 'Gov'>, number> = {
  Edu: 0.01,
  Pro: 0.05,
}

function PaymentPageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const pkg = (params.get('pkg') as PackageName) || 'Edu'

  const [isPaying, setIsPaying] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [rpcBlockNumber, setRpcBlockNumber] = useState<number | null>(null)

  // Đã gỡ Supabase: cho phép truy cập trang thanh toán không cần đăng nhập

  const isFree = pkg === 'Gov'
  const amountEth = useMemo(() => (isFree ? 0 : PACKAGE_PRICES_ETH[pkg as 'Edu' | 'Pro'] || 0), [pkg, isFree])
  const toAddress = useMemo(() => process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || DEFAULT_PAYMENT_ADDRESS, [])

  useEffect(() => {
    if (isFree) {
      toast('Gói miễn phí, không cần thanh toán')
    }
  }, [isFree])

  // Read-only provider linked to the provided Infura RPC URL
  useEffect(() => {
    const provider = new JsonRpcProvider(INFURA_MAINNET_RPC)
    provider
      .getBlockNumber()
      .then((bn) => setRpcBlockNumber(Number(bn)))
      .catch(() => setRpcBlockNumber(null))
  }, [])

  const ensureMainnet = async () => {
    const anyWindow = window as any
    if (!anyWindow.ethereum) return false
    try {
      // Query current chain
      const provider = new BrowserProvider(anyWindow.ethereum)
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
      if (Number(network.chainId) === 1) return true
      // Attempt to switch to mainnet
      await anyWindow.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      })
      const after = await provider.getNetwork()
      setChainId(Number(after.chainId))
      return Number(after.chainId) === 1
    } catch (switchErr) {
      // Try adding Ethereum mainnet with the provided Infura RPC as a fallback
      try {
        await anyWindow.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              rpcUrls: [INFURA_MAINNET_RPC],
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://etherscan.io'],
            },
          ],
        })
        // Switch again after adding
        await anyWindow.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }],
        })
        const provider = new BrowserProvider(anyWindow.ethereum)
        const after = await provider.getNetwork()
        setChainId(Number(after.chainId))
        return Number(after.chainId) === 1
      } catch {
        return false
      }
    }
  }

  const connectWallet = async () => {
    try {
      const anyWindow = window as any
      if (!anyWindow.ethereum) {
        toast.error('Không tìm thấy ví.')
        return
      }
      const provider = new BrowserProvider(anyWindow.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setWalletAddress(address)
      const ok = await ensureMainnet()
      if (!ok) {
        toast.error('Vui lòng chuyển mạng ví sang Ethereum Mainnet (chainId 1).')
      } else {
        toast.success('Đã kết nối ví')
      }
    } catch (e) {
      toast.error('Kết nối ví thất bại')
    }
  }

  const handlePay = async () => {
    if (isFree) {
      toast('Gói miễn phí, không cần thanh toán')
      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      toast.error('Địa chỉ thanh toán không hợp lệ')
      return
    }
    try {
      setIsPaying(true)
      const anyWindow = window as any
      if (!anyWindow.ethereum) {
        toast.error('Không tìm thấy ví. Vui lòng cài MetaMask.')
        return
      }
      const provider = new BrowserProvider(anyWindow.ethereum)
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
      if (Number(network.chainId) !== 1) {
        const ok = await ensureMainnet()
        if (!ok) {
          toast.error('Cần chuyển mạng sang Ethereum Mainnet để thanh toán.')
          return
        }
      }
      const signer = await provider.getSigner()
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: parseEther(String(amountEth)),
      })
      toast.loading('Đang xử lý thanh toán...', { id: 'pay' })
      await tx.wait()
      toast.success('Thanh toán thành công!', { id: 'pay' })
    } catch (e) {
      toast.error('Thanh toán thất bại')
    } finally {
      setIsPaying(false)
    }
  }
  

  // Không hiển thị nội dung nếu chưa đăng nhập (sẽ redirect)
  

  return (
    <div className="min-h-screen bg-hero">
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-slate-700 hover:text-blue-600 font-semibold">ViLaw</Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700">Thanh toán</span>
            </div>
            <Link href="/" className="btn-ghost text-sm">Quay lại Trang chủ</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-elevated">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Thanh toán gói dịch vụ</h1>
          <p className="text-slate-600 mb-8">Ethereum Mainnet qua MetaMask</p>

          <div className="space-y-8">
            <div>
              <label htmlFor="package-select" className="block text-sm font-medium text-slate-700 mb-3">Gói dịch vụ</label>
              <select
                id="package-select"
                className="select-field"
                value={pkg}
                onChange={(e) => window.location.replace(`/payment?pkg=${e.target.value}`)}
              >
                <option value="Gov">Gov (Miễn phí)</option>
                <option value="Edu">Edu (0.01 ETH)</option>
                <option value="Pro">Pro (0.05 ETH)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="text-sm text-slate-500 mb-2">Số tiền</div>
                <div className="text-2xl font-bold text-slate-900">{amountEth} ETH</div>
              </div>
              <div className="card">
                <div className="text-sm text-slate-500 mb-2">Địa chỉ nhận</div>
                <div className="text-sm font-mono break-all text-slate-700">{toAddress}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="text-sm text-slate-500 mb-2">Ví</div>
                <div className="text-sm font-mono break-all text-slate-700">{walletAddress || 'Chưa kết nối'}</div>
              </div>
              <div className="card">
                <div className="text-sm text-slate-500 mb-2">Mạng</div>
                <div className="text-sm text-slate-700">{chainId ? `ChainId ${chainId}` : 'Chưa xác định'}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={connectWallet}
                className="btn-secondary flex-1"
              >
                Kết nối ví
              </button>
              <button
                onClick={handlePay}
                disabled={isPaying || isFree}
                className={`flex-1 ${
                  isFree
                    ? 'btn-secondary cursor-not-allowed'
                    : 'btn-primary'
                } ${isPaying ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isFree ? 'Gói miễn phí' : isPaying ? 'Đang thanh toán...' : 'Thanh toán'}
              </button>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              <div className="font-medium mb-1">RPC Endpoint:</div>
              <div className="font-mono break-all">{INFURA_MAINNET_RPC}</div>
              {rpcBlockNumber !== null && (
                <div className="mt-1">Block #{rpcBlockNumber}</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}> 
      <PaymentPageContent />
    </Suspense>
  )
}
