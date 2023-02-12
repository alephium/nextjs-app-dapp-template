import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Project } from '@alephium/web3'
import { Settings } from '../alephium.config'
import fs from 'fs'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFaucet: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get the faucet contract
  const token = Project.contract('TokenFaucet')
  // Get settings
  const issueTokenAmount = network.settings.issueTokenAmount
  const result = await deployer.deployContract(token, {
    // The amount of token to be issued
    issueTokenAmount: issueTokenAmount,
    // The initial states of the faucet contract
    initialFields: {
      symbol: Buffer.from('TF', 'utf8').toString('hex'),
      name: Buffer.from('TokenFaucet', 'utf8').toString('hex'),
      decimals: 18n,
      supply: issueTokenAmount,
      balance: issueTokenAmount
    }
  })

  const group = deployer.account.group
  const config = JSON.stringify({
    group: { faucetContractId: result.contractId }
  })
  const networkName = getNetworkName(network.networkId)

  fs.writeFileSync(`configs/${networkName}.json`, config)

  console.log('Token faucet contract id: ' + result.contractId)
  console.log('Token faucet contract address: ' + result.contractAddress)
}

function getNetworkName(networkId?: number): string {
  const networkName = { 0: 'mainnet', 1: 'testnet', 4: 'devnet' }[networkId]
  if (!networkName) {
    throw Error(`Can not resolve network name with network id ${networkId}`)
  }
  return networkName
}

export default deployFaucet
