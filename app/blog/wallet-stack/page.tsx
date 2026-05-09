import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'The EVM wallet stack, explained for builders — shreyas padmakiran',
  description:
    'A field guide from raw window.ethereum calls to production wagmi v2. EIP-1193, EIP-6963, EIP-712, EIP-1271, ERC-4337, EIP-7702, EIP-5792 and what trips you up in production.',
};

const LAYER_DIAGRAM = `┌────────────────────────────────────────────────┐
│ Layer 4: App-to-Wallet RPC                     │
│ EIP-5792 (wallet_sendCalls, capabilities)      │
│ EIP-3085 / EIP-3326 (addChain / switchChain)   │
├────────────────────────────────────────────────┤
│ Layer 3: Account Model                         │
│ EIP-55 (checksum) · ERC-4337 (smart accounts)  │
│ EIP-7702 (EOA-with-code) · ERC-7579 (modular)  │
├────────────────────────────────────────────────┤
│ Layer 2: Signing                               │
│ EIP-191 (personal_sign) · EIP-712 (typed data) │
│ EIP-1271 (contract sigs) · EIP-2612 (permit)   │
├────────────────────────────────────────────────┤
│ Layer 1: Provider / Transport / Discovery      │
│ EIP-1193 (the API contract) · EIP-6963 (discov)│
│ WalletConnect v2 · Embedded wallets            │
└────────────────────────────────────────────────┘`;

const ERC4337_DIAGRAM = `Your dApp
   |
   | submits UserOperation (not a regular tx)
   v
[Bundler] (Pimlico, Alchemy, etc.)
   | calls EntryPoint.handleOps()
   v
[EntryPoint singleton contract]
   | calls validateUserOp() on the account
   | if valid, calls execute() on the account
   v
[Your Smart Contract Account]
   | optional: Paymaster covers gas costs`;

const EIP1193_INTERFACE = `interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on(event: 'connect' | 'disconnect' | 'chainChanged' | 'accountsChanged' | 'message', listener: Function): void
  removeListener(event: string, listener: Function): void
}`;

const RAW_CONNECT = `const connect = async () => {
  if (!window.ethereum) throw new Error('No wallet installed')

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  })

  const chainId = await window.ethereum.request({
    method: 'eth_chainId'
  })

  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    console.log('Accounts changed:', accounts)
  })

  window.ethereum.on('chainChanged', (_chainId: string) => {
    // reload on chain change, stale chain state causes subtle bugs
    window.location.reload()
  })

  return { accounts, chainId }
}`;

const EIP6963 = `type EIP6963ProviderInfo = {
  uuid: string  // stable identifier per extension install
  name: string  // "MetaMask", "Trust Wallet", "Rabby", etc.
  icon: string  // data URI for the wallet icon
  rdns: string  // reverse DNS: "io.metamask", "com.trustwallet.app"
}

type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo
  provider: any  // standard EIP-1193 provider
}

const providers: EIP6963ProviderDetail[] = []

window.addEventListener('eip6963:announceProvider', (e: any) => {
  providers.push(e.detail)
})

// fire this to trigger all installed wallets to announce themselves
window.dispatchEvent(new Event('eip6963:requestProvider'))

// rdns values you will encounter:
// io.metamask         -> MetaMask
// com.trustwallet.app -> Trust Wallet
// com.coinbase.wallet -> Coinbase Wallet
// io.rabby            -> Rabby
// xyz.rainbow         -> Rainbow`;

const WC_INIT = `import { EthereumProvider } from '@walletconnect/ethereum-provider'

const provider = await EthereumProvider.init({
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!, // mandatory in v2
  chains: [1],                       // chains you absolutely need
  optionalChains: [137, 42161, 8453], // chains you'd like but don't require
  showQrModal: true,
})

provider.on('display_uri', (uri: string) => {
  // this is the WC pairing URI, show it as a QR code
  // or open it as a deep link to launch the wallet app
})

await provider.connect()`;

const PERSONAL_SIGN = `const sig = await window.ethereum.request({
  method: 'personal_sign',
  params: [
    \`0x\${Buffer.from('Sign in to MyApp - nonce: abc123').toString('hex')}\`,
    accounts[0]
  ]
})`;

const TYPED_DATA = `const typedData = {
  types: {
    EIP712Domain: [
      { name: 'name',    type: 'string'  },
      { name: 'version', type: 'string'  },
      { name: 'chainId', type: 'uint256' },
    ],
    Permit: [
      { name: 'owner',    type: 'address' },
      { name: 'spender',  type: 'address' },
      { name: 'value',    type: 'uint256' },
      { name: 'nonce',    type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  primaryType: 'Permit',
  domain: { name: 'USD Coin', version: '2', chainId: 1 },
  message: {
    owner:    userAddress,
    spender:  routerAddress,
    value:    parseUnits('100', 6),
    nonce:    0n,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
  },
}

const sig = await window.ethereum.request({
  method: 'eth_signTypedData_v4',
  params: [userAddress, JSON.stringify(typedData)]
})`;

const ISVALIDSIG = `function isValidSignature(bytes32 hash, bytes signature)
  external view returns (bytes4) {
  // returns 0x1626ba7e on success, anything else means invalid
}`;

const VERIFY_MESSAGE = `import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({ chain: mainnet, transport: http() })

const isValid = await client.verifyMessage({
  address: signer,
  message: 'Sign in to MyApp',
  signature: sig,
})
// handles plain EOAs via ecrecover
// and smart accounts via EIP-1271 on-chain call`;

const PERMIT = `const sig = await signTypedDataAsync({
  domain: {
    name: 'USD Coin',
    version: '2',
    chainId: 1,
    verifyingContract: USDC
  },
  types: {
    Permit: [
      { name: 'owner',    type: 'address' },
      { name: 'spender',  type: 'address' },
      { name: 'value',    type: 'uint256' },
      { name: 'nonce',    type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ]
  },
  primaryType: 'Permit',
  message: {
    owner:    address,
    spender:  VAULT,
    value:    amount,
    nonce,
    deadline: BigInt(deadline)
  },
})

// now pass the sig (v, r, s) into your contract's depositWithPermit()`;

const SWITCH_OR_ADD = `async function switchOrAdd(chainId: number, chainParams: AddEthereumChainParameter) {
  const hexChainId = \`0x\${chainId.toString(16)}\`

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    })
  } catch (e: any) {
    const chainNotFound =
      e.code === 4902 ||
      e.code === -32603 ||
      e.code === -32601 ||
      /unrecognized chain/i.test(e.message) ||
      /chain.*not.*added/i.test(e.message)

    if (chainNotFound) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: hexChainId,
          chainName: chainParams.chainName,
          nativeCurrency: chainParams.nativeCurrency,
          rpcUrls: chainParams.rpcUrls,
          blockExplorerUrls: chainParams.blockExplorerUrls,
        }],
      })
    } else {
      throw e
    }
  }
}`;

const SEND_CALLS = `// check what this wallet can actually do
const capabilities = await provider.request({
  method: 'wallet_getCapabilities'
})

// response looks something like:
// {
//   "0x1": {
//     "atomic": { "status": "supported" },
//     "paymasterService": { "supported": true }
//   }
// }

const chainCaps = capabilities[\`0x\${chainId.toString(16)}\`]

if (chainCaps?.atomic?.status === 'supported') {
  // send a batch: approve + swap in one shot, atomically
  const { id } = await provider.request({
    method: 'wallet_sendCalls',
    params: [{
      version: '1.0',
      chainId: \`0x\${chainId.toString(16)}\`,
      from: address,
      atomicRequired: true,
      calls: [
        { to: TOKEN, data: approveCalldata },
        { to: ROUTER, data: swapCalldata },
      ],
      capabilities: chainCaps.paymasterService
        ? { paymasterService: { url: 'https://your-paymaster.example.com' } }
        : undefined,
    }]
  })

  // poll for status
  let result
  while (!result?.receipts) {
    await new Promise(r => setTimeout(r, 1000))
    result = await provider.request({
      method: 'wallet_getCallsStatus',
      params: [id],
    })
  }
}`;

const PROVIDER_SOURCES = `Browser extension     ->  window.ethereum (EIP-1193 provider)
EIP-6963 discovery    ->  event.detail.provider (EIP-1193 provider)
WalletConnect v2      ->  EthereumProvider instance (EIP-1193 provider)
Coinbase Smart Wallet ->  CoinbaseWalletProvider (EIP-1193 provider)
Privy / Dynamic       ->  embedded EIP-1193 or viem wallet client`;

const WALLET_FLAGS = `const isMetaMask = window.ethereum?.isMetaMask === true
const isTrust    = window.ethereum?.isTrust === true
              || window.trustwallet?.ethereum?.isTrust === true
const isCoinbase = window.ethereum?.isCoinbaseWallet === true
const isRabby    = window.ethereum?.isRabby === true`;

const WAGMI_CONFIG = `// config.ts
import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { mainnet, base, arbitrum } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet, safe } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, base, arbitrum],
  connectors: [
    injected({ shimDisconnect: true }),  // EIP-6963 multi-wallet discovery
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
      metadata: {
        name: 'MyApp',
        description: 'My dApp',
        url: 'https://myapp.xyz',
        icons: ['https://myapp.xyz/icon.png'],
      },
    }),
    coinbaseWallet({
      appName: 'MyApp',
      preference: 'all', // use 'smartWalletOnly' to force the Coinbase Smart Wallet popup
    }),
    safe(),
  ],
  transports: {
    [mainnet.id]:  http('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
    [base.id]:     http('https://base-mainnet.g.alchemy.com/v2/YOUR_KEY'),
    [arbitrum.id]: http(),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
})`;

const WAGMI_PROVIDERS = `// providers.tsx for Next.js App Router
'use client'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config'

const queryClient = new QueryClient()

export function Providers({
  children,
  cookie,
}: {
  children: React.ReactNode
  cookie: string | null
}) {
  const initialState = cookieToInitialState(config, cookie)
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}`;

const WAGMI_LAYOUT = `// app/layout.tsx — pass the cookie from the server into the provider
import { headers } from 'next/headers'
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookie = headers().get('cookie')
  return (
    <html>
      <body>
        <Providers cookie={cookie}>{children}</Providers>
      </body>
    </html>
  )
}`;

const WALLET_SECTION = `import { useAccount, useConnect, useDisconnect, useConnectors, useSwitchChain } from 'wagmi'

export function WalletSection() {
  const { address, isConnected, chain } = useAccount()
  const { connect, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const connectors = useConnectors()

  if (isConnected) {
    return (
      <div>
        <p>{address}</p>
        <p>Chain: {chain?.name}</p>
        <button onClick={() => switchChain({ chainId: 8453 })}>
          Switch to Base
        </button>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map(connector => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
        >
          {connector.name}
        </button>
      ))}
      {error && <p>Error: {error.message}</p>}
    </div>
  )
}`;

const ABI_AS_CONST = `// no type inference on args or return values without as const
const abi = [{ type: 'function', name: 'balanceOf', /* ... */ }]

// full inference with it
export const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const`;

const PORTFOLIO_READS = `import { useReadContract, useReadContracts, useBalance } from 'wagmi'
import { erc20Abi } from './abi'

function Portfolio({ address }: { address: \`0x\${string}\` }) {
  // native ETH balance
  const { data: ethBalance } = useBalance({ address })

  // single contract read
  const { data: usdcBalance } = useReadContract({
    address: '0xA0b86991c6218b36c1d19D4a2e9EbOcE3606eB48',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
      staleTime: 30_000,       // skip refetch if data is under 30s old
      refetchInterval: 60_000, // poll every 60s in the background
    },
  })

  // multicall batches multiple reads into one RPC request
  const { data: tokenData } = useReadContracts({
    contracts: [
      { address: USDC, abi: erc20Abi, functionName: 'symbol' },
      { address: USDC, abi: erc20Abi, functionName: 'decimals' },
      { address: USDC, abi: erc20Abi, functionName: 'totalSupply' },
    ],
    allowFailure: true, // one failing read won't kill the entire batch
  })

  // pin a read to a specific chain regardless of what the user is connected to
  const { data: baseBalance } = useReadContract({
    chainId: 8453,
    address: BASE_TOKEN,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  })
}`;

const TRANSFER_BUTTON = `import {
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { parseUnits } from 'viem'
import { erc20Abi } from './abi'

function TransferButton({
  token,
  to,
  amount,
}: {
  token: \`0x\${string}\`
  to: \`0x\${string}\`
  amount: string
}) {
  const { address } = useAccount()

  // step 1: simulate to check for reverts before touching the wallet
  const {
    data: sim,
    error: simError,
    isPending: simLoading,
  } = useSimulateContract({
    address: token,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [to, parseUnits(amount, 6)],
    query: { enabled: !!address && !!amount && !!to },
  })

  // step 2: write, only triggered when the user clicks
  const {
    writeContract,
    data: txHash,
    isPending: waitingForWallet,
    error: writeError,
  } = useWriteContract()

  // step 3: wait for mining
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  const isDisabled = !sim || waitingForWallet || isMining || simLoading

  return (
    <div>
      <button
        disabled={isDisabled}
        onClick={() => writeContract(sim!.request)}
      >
        {waitingForWallet ? 'Confirm in wallet...'
         : isMining ? 'Mining...'
         : isSuccess ? 'Done'
         : 'Send'}
      </button>

      {simError && (
        <p style={{ color: 'red' }}>
          Transaction will revert: {simError.shortMessage}
        </p>
      )}
    </div>
  )
}`;

const SIGN_SECTION = `import { useSignMessage, useSignTypedData } from 'wagmi'

function SignSection() {
  const { signMessageAsync } = useSignMessage()
  const { signTypedDataAsync } = useSignTypedData()

  const handleSiwe = async () => {
    const sig = await signMessageAsync({
      message: \`Sign in to MyApp\\nNonce: \${nonce}\\nIssued: \${new Date().toISOString()}\`
    })
    // send sig + address to your backend for verification
  }

  const handlePermit = async () => {
    const sig = await signTypedDataAsync({
      domain: {
        name: 'USD Coin',
        version: '2',
        chainId: 1,
        verifyingContract: USDC
      },
      types: {
        Permit: [
          { name: 'owner',    type: 'address' },
          { name: 'spender',  type: 'address' },
          { name: 'value',    type: 'uint256' },
          { name: 'nonce',    type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ]
      },
      primaryType: 'Permit',
      message: {
        owner:    address,
        spender:  VAULT,
        value:    100_000000n,
        nonce:    0n,
        deadline: BigInt(deadline)
      },
    })
  }
}`;

const WATCH_EVENT = `import { useWatchContractEvent } from 'wagmi'

useWatchContractEvent({
  address: VAULT,
  abi: vaultAbi,
  eventName: 'Deposit',
  onLogs: (logs) => {
    logs.forEach(log => {
      console.log('Deposit:', log.args)
      queryClient.invalidateQueries({ queryKey: ['balance', address] })
    })
  },
})`;

const INVALIDATE = `import { useQueryClient } from '@tanstack/react-query'
import { useReadContract, useWriteContract } from 'wagmi'

const queryClient = useQueryClient()

const balanceQuery = useReadContract({
  address: TOKEN,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [address]
})

const { writeContract } = useWriteContract({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: balanceQuery.queryKey })
    }
  }
})`;

const RAINBOWKIT_CONFIG = `// config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, base } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'MyApp',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [mainnet, base],
  ssr: true,
})`;

const RAINBOWKIT_PROVIDERS = `// providers.tsx
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
// wrap: WagmiProvider -> QueryClientProvider -> RainbowKitProvider`;

const RAINBOWKIT_BUTTON = `import { ConnectButton } from '@rainbow-me/rainbowkit'

<ConnectButton />`;

export default function WalletStackPost() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e8e8e8',
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '20px 32px',
          borderBottom: '1px solid #141414',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: '#444',
        }}
      >
        <Link href="/" style={{ color: '#555' }}>← back</Link>
        <span>/</span>
        <Link href="/blog" style={{ color: '#555' }}>blog</Link>
        <span>/</span>
        <span>wallet-stack</span>
      </div>

      <article
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '72px 32px 120px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(30px, 4.6vw, 48px)',
            color: '#e8e8e8',
            marginBottom: 18,
            lineHeight: 1.18,
          }}
        >
          The EVM wallet stack, explained for builders
        </h1>

        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          {`A field guide from raw `}<IC>window.ethereum</IC>{` calls to production wagmi v2.`}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11,
            color: '#444',
            marginBottom: 56,
            letterSpacing: '0.04em',
          }}
        >
          <span>may 2026</span>
          <span>·</span>
          <span>20 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <P>
          {`I spent a lot of time being confused about wallets. Not the user-facing stuff, but the actual plumbing underneath. Why does `}<IC>window.ethereum</IC>{` break when you have two extensions installed? Why does the same signing code behave differently on mobile? What is the actual difference between `}<IC>personal_sign</IC>{` and `}<IC>eth_signTypedData_v4</IC>{`, and when does it matter?`}
        </P>

        <P>
          {`I kept hitting walls because I was treating wallets as a black box. Once I sat down and read through the EIPs, things clicked into place pretty fast. Turns out the wallet layer is not that complicated once you see it as four separate concerns stacked on top of each other.`}
        </P>

        <P>
          {`This post is what I wish someone had handed me before I started building. We'll go from raw browser APIs up to production wagmi v2 patterns, and I'll call out the specific things that tripped me up along the way.`}
        </P>

        <Hr />

        <H2>The four layers</H2>
        <P>
          {`Everything in the EVM wallet space lives in one of four layers. Keep this in your head as you read the rest of the post because it makes the whole thing a lot less overwhelming.`}
        </P>
        <Code>{LAYER_DIAGRAM}</Code>
        <P>{`Pretty much any issue you run into when integrating wallets traces back to one of these four layers.`}</P>

        <Hr />

        <H2>Layer 1: providers, transports, and discovery</H2>

        <H3>EIP-1193: the shared contract</H3>
        <P>
          {`EIP-1193 is the bedrock. It says every wallet must expose a `}<IC>request</IC>{` method and a handful of events. That's it. MetaMask, Trust Wallet, Coinbase Wallet, Rabby, Rainbow all implement this interface. When you call `}<IC>{`window.ethereum.request({ method: 'eth_requestAccounts' })`}</IC>{` you are using EIP-1193.`}
        </P>
        <P>{`The full interface is tiny:`}</P>
        <Code>{EIP1193_INTERFACE}</Code>
        <P>
          {`Everything you build on top of this is just composing RPC calls through that `}<IC>request</IC>{` method. The error codes are also standardized and you will see these constantly:`}
        </P>
        <Table
          headers={['Code', 'What it means']}
          rows={[
            ['4001', 'User rejected the request'],
            ['4100', 'Wallet is locked or not authorized'],
            ['4900', 'Provider disconnected'],
            ['4901', 'Not connected to the requested chain'],
          ]}
        />
        <P>{`Here is a raw connect with no library, just EIP-1193:`}</P>
        <Code>{RAW_CONNECT}</Code>

        <H3>The window.ethereum race condition and how EIP-6963 fixed it</H3>
        <P>
          {`Here is something that frustrated me for way too long. When you have multiple wallet extensions installed, they all try to write to `}<IC>window.ethereum</IC>{`. The last one to load wins, and whatever wallet lost the race is completely invisible to your dApp. Install MetaMask and Rabby at the same time and one of them simply does not exist from the dApp's perspective.`}
        </P>
        <P>
          {`EIP-6963 solved this by moving away from a shared global and into an event-based discovery system. Each wallet announces itself by firing an event with a `}<IC>{`{info, provider}`}</IC>{` pair. Your dApp listens for these announcements, collects all of them, then shows the user a list to pick from.`}
        </P>
        <Code>{EIP6963}</Code>
        <P>
          {`All major wallets support EIP-6963 now. In wagmi v2, the `}<IC>{`injected()`}</IC>{` connector handles all of this automatically so you get multi-wallet discovery without any extra work on your end.`}
        </P>

        <H3>WalletConnect v2: the mobile and QR transport</H3>
        <P>
          {`When users are on mobile or don't have an extension installed, you need WalletConnect. The way it works is your dApp and the wallet both connect to a relay server over WebSocket and exchange messages through it. The connection is initiated via a QR code or a deep link.`}
        </P>
        <P>
          {`Version 2 introduced a concept called CAIP-25 namespaces, which is where a lot of confusion comes from. You now have to declare which chains you need upfront when the session starts.`}
        </P>
        <Code>{WC_INIT}</Code>
        <P>
          {`The gotcha here: if a user tries to switch to a chain that was not in `}<IC>chains</IC>{` or `}<IC>optionalChains</IC>{` when the session was created, it will fail silently in a confusing way. Most libraries expose a flag like `}<IC>{`isNewChainsStale: false`}</IC>{` to work around this. Make sure you set it when configuring WalletConnect through wagmi.`}
        </P>

        <H3>Embedded wallets</H3>
        <P>
          {`The fourth connection type is wallets that live entirely inside your app. Privy, Dynamic, Magic, Web3Auth, Turnkey all fall into this category. They create a key pair on behalf of the user, backed by email or Google or a passkey, with key material stored in TEEs or split via Shamir's scheme across multiple custodians.`}
        </P>
        <P>
          {`From a code standpoint they give you an EIP-1193 provider or a viem wallet client, so they slot into wagmi like any other connector. The UX is completely different though, since users never install anything or leave your app. For consumer products targeting non-crypto users this changes the onboarding experience significantly.`}
        </P>

        <Hr />

        <H2>Layer 2: signing</H2>

        <H3>EIP-191: personal_sign</H3>
        <P>
          {`The simplest signing method. It prepends a standard prefix (`}<IC>{`\\x19Ethereum Signed Message:\\n`}</IC>{` followed by the message length) to your message before hashing it. This prefix is what prevents a signed message from being interpreted as a valid transaction by the EVM.`}
        </P>
        <Code>{PERSONAL_SIGN}</Code>
        <P>{`Every wallet supports this. Use it for SIWE flows and simple authentication.`}</P>

        <H3>EIP-712: typed structured data</H3>
        <P>
          {`The standard that makes signing human-readable. Instead of asking a user to sign a blob of hex they can't parse, EIP-712 lets wallets display named fields: "You are approving 100 USDC to 0xRouter at deadline 1234567890." This is the thing that actually prevents phishing via signed hashes, because users can read what they're signing.`}
        </P>
        <Code>{TYPED_DATA}</Code>
        <P>
          {`Always use v4 (`}<IC>eth_signTypedData_v4</IC>{`). v1 and v3 have known issues. If you have hardware wallet users, note that some older Ledger firmware does not support v4, so you may need a fallback to `}<IC>personal_sign</IC>{` in those cases.`}
        </P>

        <H3>EIP-1271: contract signature validation</H3>
        <P>
          {`This is the one that bites you when you first start supporting smart account wallets. EOAs sign with private keys so you can verify them with `}<IC>ecrecover</IC>{`. Smart contract wallets like Safe, Coinbase Smart Wallet, or Trust Wallet SWIFT do not have private keys in the traditional sense. They validate signatures on-chain by implementing an `}<IC>isValidSignature</IC>{` function on their contract:`}
        </P>
        <Code>{ISVALIDSIG}</Code>
        <P>
          {`If your backend verifies signatures and you only use `}<IC>ecrecover</IC>{`, signatures from smart account users will silently fail. You need to check EIP-1271 as well. viem does this automatically:`}
        </P>
        <Code>{VERIFY_MESSAGE}</Code>
        <P>
          {`EIP-6492 extends this further for counterfactual smart accounts, which are wallets that have been assigned an address but have not been deployed on-chain yet. It wraps the signature with a deployment sentinel so you can verify signatures from accounts that do not exist on-chain yet.`}
        </P>

        <H3>EIP-2612: permit</H3>
        <P>
          {`Normally approving an ERC-20 token costs a transaction and therefore gas. EIP-2612 lets a user sign an off-chain approval message instead, and then anyone (your dApp, a relayer, a Paymaster) can submit the actual `}<IC>{`permit()`}</IC>{` call on-chain. USDC, USDS, and most modern tokens ship with this.`}
        </P>
        <Code>{PERMIT}</Code>
        <P>{`Combine this with a Paymaster and you can build flows where users never need to hold ETH at all.`}</P>

        <Hr />

        <H2>Layer 3: the account model</H2>

        <H3>Three account types you need to understand</H3>
        <P>
          <B>{`EOAs `}</B>
          {`are traditional wallets. One private key, one address. MetaMask, Rabby, Rainbow, Trust Wallet in classic mode are all EOAs. Simple and battle-tested, but limited: one signer, no batching, no gas sponsorship.`}
        </P>
        <P>
          <B>{`ERC-4337 smart contract accounts `}</B>
          {`are wallet contracts. Instead of regular transactions, they submit `}<IC>UserOperation</IC>{` objects to a global `}<IC>EntryPoint</IC>{` contract via a `}<IC>Bundler</IC>{`. The account runs custom signature logic via `}<IC>validateUserOp</IC>{`, which is how you get passkeys, multisig, and arbitrary signer schemes. A `}<IC>Paymaster</IC>{` can cover the gas. Safe, Coinbase Smart Wallet, and Trust Wallet SWIFT all run on ERC-4337.`}
        </P>
        <Code>{ERC4337_DIAGRAM}</Code>
        <P>
          <B>{`EIP-7702 `}</B>
          {`is the newest and it went live on Ethereum mainnet on May 7, 2025 as part of the Pectra upgrade. It is a middle path between EOAs and full smart accounts. A new transaction type lets an EOA delegate to a smart contract by writing its address into the EOA's code slot. Your existing address gets smart account behavior (batching, passkeys, sponsored gas) without migrating to a new address. The delegation can also be removed. This is what "EOA upgrades" means in practice post-Pectra.`}
        </P>

        <H3>ERC-7579: modular smart accounts</H3>
        <P>
          {`As smart accounts proliferated, every team built their own extension system. ERC-7579 standardized it. Modules come in four types. Validators (type 1) run custom signature logic, things like passkeys, WebAuthn, and multisig. Executors (type 2) handle custom execution strategies like DCA or auto-compound. Fallback handlers (type 3) deal with callbacks like `}<IC>ERC-1271</IC>{` and `}<IC>ERC-721 receiver</IC>{`. Hooks (type 4) add pre/post-call logic for things like spending limits and allowlists.`}
        </P>
        <P>
          {`ZeroDev Kernel v3, Biconomy Nexus, Safe (via a Rhinestone adapter), and others all implement ERC-7579. The idea is that a module built for one account should work across all of them.`}
        </P>

        <Hr />

        <H2>Layer 4: app-to-wallet RPC</H2>

        <H3>Chain switching: actual behavior vs. the spec</H3>
        <P>
          {`Two methods cover this: `}<IC>wallet_switchEthereumChain</IC>{` to switch to a chain the wallet knows about, and `}<IC>wallet_addEthereumChain</IC>{` to add a new one first. The spec says the switch method should return error code `}<B>4902</B>{` if the chain is not found. In production that is not always what happens.`}
        </P>
        <P>
          {`MetaMask Mobile has shipped versions returning `}<B>-32601</B>{` ("method not found"). Coinbase Wallet SDK has returned `}<B>-32603</B>{` for unknown chains. Some wallets throw completely unstructured error messages with no code at all. Trust Wallet's mobile dApp browser can throw errors that don't match any of these.`}
        </P>
        <P>{`The robust pattern is to catch all of them:`}</P>
        <Code>{SWITCH_OR_ADD}</Code>

        <H3>EIP-5792: the batched call API</H3>
        <P>
          {`This is the one worth paying attention to going forward. EIP-5792 adds `}<IC>wallet_getCapabilities</IC>{` and `}<IC>wallet_sendCalls</IC>{` to the standard provider API. Instead of sending one transaction at a time, you can send a batch and ask the wallet whether it can execute them atomically and whether it supports gas sponsorship.`}
        </P>
        <Code>{SEND_CALLS}</Code>
        <P>
          {`Coinbase Smart Wallet supports this today. MetaMask and Trust Wallet are adding support as they roll out EIP-7702. If you write against `}<IC>wallet_sendCalls</IC>{` once and fall back to `}<IC>eth_sendTransaction</IC>{` for wallets that don't support it yet, your code stays the same as the ecosystem catches up.`}
        </P>

        <Hr />

        <H2>Connecting wallets to your frontend</H2>
        <P>
          {`The mental model is simple. Every connection technique is just a way to get hold of an EIP-1193 provider. The source changes but the interface is always the same.`}
        </P>
        <Code>{PROVIDER_SOURCES}</Code>
        <P>{`Once you have the provider, all the RPC calls are identical across every wallet. That's the whole point of EIP-1193.`}</P>

        <H3>Detecting specific wallets</H3>
        <P>{`Different wallets inject different markers onto the provider. Here is what to check:`}</P>
        <Code>{WALLET_FLAGS}</Code>
        <P>
          {`Trust Wallet is notable here because it also injects `}<IC>window.trustwallet.solana</IC>{`, `}<IC>window.trustwallet.cosmos</IC>{`, and `}<IC>window.trustwallet.aptos</IC>{` for non-EVM chains. It's the only major wallet that does multi-VM injection from a single namespace in the browser.`}
        </P>
        <P>
          {`That said, the better approach is to rely on EIP-6963 `}<IC>rdns</IC>{` values rather than window globals that can get clobbered. The stable identifiers are:`}
        </P>
        <UL
          items={[
            <><IC>io.metamask</IC>{` for MetaMask`}</>,
            <><IC>com.trustwallet.app</IC>{` for Trust Wallet`}</>,
            <><IC>com.coinbase.wallet</IC>{` for Coinbase Wallet`}</>,
            <><IC>io.rabby</IC>{` for Rabby`}</>,
            <><IC>xyz.rainbow</IC>{` for Rainbow`}</>,
          ]}
        />

        <H3>Mobile wallet behavior</H3>
        <P>{`Mobile is where wallets diverge the most. A few things worth knowing:`}</P>
        <P>
          {`MetaMask Mobile ships with an in-app dApp browser and also supports WalletConnect v2 for connecting to desktop dApps from the mobile wallet.`}
        </P>
        <P>
          {`Trust Wallet removed its in-app dApp browser on iOS back in 2021 to comply with App Store policies. On Android the in-app browser still works. But if you're building for iOS users connecting to Trust Wallet from an external browser, WalletConnect v2 is the only path that works. Trust's `}<IC>{`trust://`}</IC>{` deep links are for things like sending and swapping, not for dApp session establishment. Routing users through those for wallet connection will fail on iOS.`}
        </P>
        <P>
          {`Coinbase Wallet connects via its SDK with QR or a deep link and decides at connection time whether to use the mobile app or the Smart Wallet popup based on what the user has set up.`}
        </P>
        <P>{`Rainbow and Rabby both use WalletConnect v2 for mobile in all cases.`}</P>

        <Hr />

        <H2>Building with wagmi v2</H2>
        <P>
          {`wagmi v2 is the standard way to handle wallet interactions in a React app. It sits on top of viem (which handles types and low-level RPC) and TanStack Query (which handles caching, retries, and state). viem gives you the primitives, TanStack Query gives you async state management, and wagmi hooks tie them together.`}
        </P>

        <H3>Setup</H3>
        <Code>{WAGMI_CONFIG}</Code>
        <Code>{WAGMI_PROVIDERS}</Code>
        <Code>{WAGMI_LAYOUT}</Code>
        <P>
          {`The SSR setup is one of the most commonly skipped things when people set up wagmi for the first time. Skip it and you get hydration errors because the server renders the disconnected state and the client renders the connected state and React throws a fit.`}
        </P>

        <H3>Connecting and account state</H3>
        <Code>{WALLET_SECTION}</Code>

        <H3>Type-safe ABIs</H3>
        <P>
          {`Always write ABIs with `}<IC>as const</IC>{`. Without it, wagmi and viem cannot infer the types of your function parameters and return values, which removes a lot of the value of using TypeScript here.`}
        </P>
        <Code>{ABI_AS_CONST}</Code>
        <P>
          {`If you have deployment artifacts, `}<IC>wagmi-cli</IC>{` can generate fully typed hooks from them directly.`}
        </P>

        <H3>Reading on-chain data</H3>
        <Code>{PORTFOLIO_READS}</Code>

        <H3>Writing transactions</H3>
        <P>
          {`The correct pattern is simulate first, then write, then wait. Simulating first tells you whether the transaction will revert before the wallet popup even opens. Users don't have to confirm something that will fail.`}
        </P>
        <Code>{TRANSFER_BUTTON}</Code>

        <H3>Signing</H3>
        <Code>{SIGN_SECTION}</Code>

        <H3>Watch events instead of polling</H3>
        <Code>{WATCH_EVENT}</Code>

        <H3>Invalidating reads after writes</H3>
        <P>
          {`Every wagmi query hook exposes a `}<IC>queryKey</IC>{`. After a write completes, invalidate the relevant reads to refresh the UI immediately instead of waiting for the next poll:`}
        </P>
        <Code>{INVALIDATE}</Code>

        <Hr />

        <H2>Things that will catch you off guard</H2>
        <P>{`These are the issues that don't show up in tutorials but that you will hit in production.`}</P>

        <P>
          <B><IC>eth_sign</IC>{` is dangerous and you should not use it. `}</B>
          {`It signs a raw 32-byte hash, which means a signed message could technically be a valid transaction. MetaMask hides it by default now. Use `}<IC>personal_sign</IC>{` or `}<IC>eth_signTypedData_v4</IC>{`.`}
        </P>
        <P>
          <B>{`BigInt literals are required. `}</B>
          <IC>{`args: [100]`}</IC>{` causes a runtime error because viem expects bigint, not number. Use `}<IC>100n</IC>{`, `}<IC>{`parseUnits('100', 6)`}</IC>{`, or `}<IC>{`BigInt(100)`}</IC>{`.`}
        </P>
        <P>
          <B>{`SSR hydration mismatches in Next.js. `}</B>
          {`wagmi reads connection state from storage on the client. The server renders disconnected, the client renders connected, React throws a hydration error. Fix it by setting `}<IC>{`ssr: true`}</IC>{` and `}<IC>cookieStorage</IC>{` in your config and passing `}<IC>cookieToInitialState</IC>{` from your layout.`}
        </P>
        <P>
          <B>{`Smart account signature verification on your backend. `}</B>
          {`If you do SIWE or any server-side signature verification and you use plain `}<IC>ecrecover</IC>{`, it will fail for users on Safe, Coinbase Smart Wallet, Trust Wallet SWIFT, or any ERC-4337 account. Use viem's `}<IC>verifyMessage</IC>{` which handles both EOAs via ecrecover and EIP-1271 contract verification.`}
        </P>
        <P>
          <B>{`Stale WalletConnect sessions. `}</B>
          {`WC v2 persists sessions in localStorage under `}<IC>wc@2:*</IC>{` keys. A leftover session from a previous visit can silently reconnect to a disconnected wallet when a new user loads the page. Call wagmi's `}<IC>{`disconnect()`}</IC>{` on logout to clear it. If you're debugging weird reconnection behavior, clearing all `}<IC>wc@2:*</IC>{` keys in localStorage is the first thing to try.`}
        </P>
        <P>
          <B>{`Calling `}<IC>writeContract</IC>{` without a simulation result. `}</B>
          {`If `}<IC>sim</IC>{` is undefined because the simulation has not resolved yet, passing it to `}<IC>writeContract</IC>{` blows up. Always gate your write button on `}<IC>!!sim</IC>{`.`}
        </P>
        <P>
          <B>{`Chain add vs chain switch behavior. `}</B>
          {`After `}<IC>wallet_addEthereumChain</IC>{` succeeds, some wallets automatically switch to the new chain. Others don't. Always follow up with `}<IC>wallet_switchEthereumChain</IC>{` after adding.`}
        </P>
        <P>
          <B>{`Trust Wallet on iOS has no in-app dApp browser. `}</B>
          {`It was removed to comply with App Store policies. If a user is on iOS and you route them through a Trust Wallet deep link to open a dApp, it will fail. WalletConnect v2 is how Trust Wallet connects on iOS and you should use that as your default mobile path.`}
        </P>

        <Hr />

        <H2>Adding a UI kit</H2>
        <P>{`RainbowKit is the fastest way to get a production-ready wallet connection modal without building one yourself.`}</P>
        <Code>{RAINBOWKIT_CONFIG}</Code>
        <Code>{RAINBOWKIT_PROVIDERS}</Code>
        <Code>{RAINBOWKIT_BUTTON}</Code>
        <P>
          {`RainbowKit uses EIP-6963 internally, so MetaMask, Trust Wallet, Rabby, Coinbase Wallet, Rainbow, and any other EIP-6963-compliant wallet show up in the list automatically.`}
        </P>

        <Hr />

        <H2>Where things are heading</H2>
        <P>
          {`EIP-7702 went live on Ethereum mainnet on May 7, 2025. The practical effect is that existing EOA users can get smart account features without moving to a new address. Wallets are shipping support at different speeds. MetaMask has the Delegation Toolkit. Trust Wallet's smart contract team co-authored ERC-7779, which standardizes how delegations can move between wallet vendors so users aren't locked into one wallet after delegating.`}
        </P>
        <P>
          {`EIP-5792 is the write path to build toward. Write against `}<IC>wallet_sendCalls</IC>{` and check capabilities first. Coinbase Smart Wallet supports it today. Other wallets are adding it as they ship EIP-7702 and smart account support. Your dApp code stays the same as the ecosystem catches up.`}
        </P>
        <P>
          {`The signing layer is moving toward passkeys. WebAuthn with secp256r1 is the signer scheme behind Coinbase Smart Wallet, Trust Wallet SWIFT, and most new embedded wallets. EIP-7212 adds a native precompile for cheap P-256 verification on L2s. If you're building a new wallet experience, passkeys are quickly becoming the baseline expectation for onboarding UX.`}
        </P>

        <Hr />

        <H2>Quick reference</H2>
        <Table
          headers={['What I want to do', 'What to use']}
          rows={[
            ['Support all installed browser wallets', <><IC>{`injected()`}</IC>{` connector via EIP-6963`}</>],
            ['Support mobile users on iOS', 'WalletConnect v2'],
            ['Basic message signing for SIWE', <><IC>personal_sign</IC>{` via EIP-191`}</>],
            ['Human-readable structured signing', <><IC>eth_signTypedData_v4</IC>{` via EIP-712`}</>],
            ['Verify signatures from smart accounts', <>{`EIP-1271 via `}<IC>viem.verifyMessage</IC></>],
            ['Gasless token approvals', 'EIP-2612 permit'],
            ['Batch transactions', <>{`EIP-5792 `}<IC>wallet_sendCalls</IC>{` with `}<IC>eth_sendTransaction</IC>{` fallback`}</>],
            ['React wallet integration', 'wagmi v2 + viem + TanStack Query'],
            [`Check a tx won't revert before popup`, <><IC>useSimulateContract</IC>{` before `}<IC>useWriteContract</IC></>],
            ['React to on-chain events', <IC>useWatchContractEvent</IC>],
          ]}
        />

        <Hr />

        <H2>Further reading</H2>
        <UL
          items={[
            <><A href="https://eips.ethereum.org/EIPS/eip-1193">EIP-1193</A>{` — Ethereum Provider JavaScript API`}</>,
            <><A href="https://eips.ethereum.org/EIPS/eip-6963">EIP-6963</A>{` — Multi Injected Provider Discovery`}</>,
            <><A href="https://eips.ethereum.org/EIPS/eip-712">EIP-712</A>{` — Typed structured data hashing and signing`}</>,
            <><A href="https://eips.ethereum.org/EIPS/eip-4337">ERC-4337</A>{` — Account Abstraction via EntryPoint`}</>,
            <><A href="https://eips.ethereum.org/EIPS/eip-7702">EIP-7702</A>{` — Set Code for EOAs (Pectra)`}</>,
            <><A href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-5792.md">EIP-5792</A>{` — Wallet Call API`}</>,
            <><A href="https://eips.ethereum.org/EIPS/eip-7579">ERC-7579</A>{` — Minimal Modular Smart Accounts`}</>,
            <><A href="https://wagmi.sh">wagmi docs</A>{` — v2 hooks and config reference`}</>,
            <><A href="https://viem.sh">viem docs</A>{` — TypeScript Ethereum primitives`}</>,
            <><A href="https://rainbowkit.com">RainbowKit docs</A>{` — wallet UI kit`}</>,
            <><A href="https://docs.pimlico.io">Pimlico docs</A>{` — ERC-4337 bundler and smart account tooling`}</>,
          ]}
        />

        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 28,
            color: '#555',
            marginTop: 64,
            letterSpacing: '0.02em',
          }}
        >
          — shreyas
        </p>
      </article>
    </div>
  );
}

const pStyle: CSSProperties = {
  color: '#9a9a9a',
  fontSize: 14,
  lineHeight: 1.85,
  marginBottom: 22,
};

function P({ children }: { children: ReactNode }) {
  return <p style={pStyle}>{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 26,
        color: '#e8e8e8',
        marginTop: 56,
        marginBottom: 18,
        lineHeight: 1.25,
      }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        fontSize: 14,
        color: '#d6d6d6',
        marginTop: 36,
        marginBottom: 14,
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </h3>
  );
}

function IC({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        background: '#141414',
        border: '1px solid #1c1c1c',
        color: '#d0c8a8',
        padding: '1px 6px',
        borderRadius: 3,
        fontSize: '0.86em',
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
      }}
    >
      {children}
    </code>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: '#0d0d0d',
        border: '1px solid #161616',
        borderRadius: 4,
        padding: '16px 18px',
        overflowX: 'auto',
        color: '#c8c8c8',
        fontSize: 12.5,
        lineHeight: 1.65,
        margin: '14px 0 22px',
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
      }}
    >
      <code>{children}</code>
    </pre>
  );
}

function Hr() {
  return (
    <hr
      style={{
        border: 0,
        borderTop: '1px solid #161616',
        margin: '40px 0',
      }}
    />
  );
}

function B({ children }: { children: ReactNode }) {
  return <strong style={{ color: '#e0e0e0', fontWeight: 500 }}>{children}</strong>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: '#a0a0a0',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        textDecorationColor: '#333',
      }}
    >
      {children}
    </a>
  );
}

function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: '0 0 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            color: '#9a9a9a',
            fontSize: 13.5,
            lineHeight: 1.8,
            paddingLeft: 16,
            position: 'relative',
          }}
        >
          <span style={{ position: 'absolute', left: 0, color: '#444' }}>—</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div style={{ overflowX: 'auto', margin: '14px 0 22px' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: 12.5,
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  border: '1px solid #1a1a1a',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: '#101010',
                  color: '#bdbdbd',
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: '1px solid #1a1a1a',
                    padding: '8px 12px',
                    color: '#8e8e8e',
                    verticalAlign: 'top',
                    lineHeight: 1.7,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
