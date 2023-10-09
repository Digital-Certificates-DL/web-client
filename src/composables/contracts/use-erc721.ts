import { ref, computed } from 'vue'
import { Erc721__factory, EthProviderRpcError } from '@/types'
import { useWeb3ProvidersStore } from '@/store'
import { handleEthError } from '@/helpers'
import { config } from '@config'

export const useErc721 = () => {
  const web3ProvidersStore = useWeb3ProvidersStore()
  const provider = computed(() => web3ProvidersStore.provider)

  const contractAddress = ref(config.CONTRACT || '')

  const contractInterface = Erc721__factory.createInterface()

  const init = (address: string) => {
    if (!address) return

    contractAddress.value = address
  }

  const safeMint = async (address: string, uri: string) => {
    if (!provider.value) return

    try {
      const data = contractInterface.encodeFunctionData('safeMint', [
        address,
        uri,
      ])

      return provider.value.getHashFromTxResponse(
        await provider.value.signAndSendTx({
          to: contractAddress.value,
          data,
        }),
      )
    } catch (error) {
      handleEthError(error as EthProviderRpcError)
    }
  }

  return {
    init,
    safeMint,
  }
}
