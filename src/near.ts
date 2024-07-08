import { distinctUntilChanged, map } from 'rxjs'

// near api js
import { providers } from 'near-api-js'

// wallet selector
import '@near-wallet-selector/modal-ui/styles.css'

import { setupModal } from '@near-wallet-selector/modal-ui'
import { NetworkId, setupWalletSelector, WalletSelector } from '@near-wallet-selector/core'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'

const THIRTY_TGAS = '30000000000000'
const NO_DEPOSIT = '0'

type WalletParams = {
  networkId?: NetworkId
  createAccessKeyFor?: string
  methodNames?: string[]
}

type ContractParams<T extends Object> = {
  contractId: string
  method: string
  args?: T
  gas?: string
  deposit?: string
}

export class Wallet {
  private createAccessKeyFor: string
  private networkId: NetworkId
  private methodNames: string[]
  private selector: Promise<WalletSelector>

  /**
   * @constructor
   * @param {Object} options - the options for the wallet
   * @param {string} options.networkId - the network id to connect to
   * @param {string} options.createAccessKeyFor - the contract to create an access key for
   * @example
   * const wallet = new Wallet({ networkId: 'testnet', createAccessKeyFor: 'contractId' });
   * wallet.startUp((signedAccountId) => console.log(signedAccountId));
   */
  constructor(params: WalletParams) {
    const { networkId = 'testnet', createAccessKeyFor = '', methodNames = [] } = params

    this.createAccessKeyFor = createAccessKeyFor
    this.networkId = networkId
    this.methodNames = methodNames
    this.selector = Promise.resolve({} as WalletSelector)
  }

  /**
   * To be called when the website loads
   * @param {Function} accountChangeHook - a function that is called when the user signs in or out#
   * @returns {Promise<string>} - the accountId of the signed-in user
   */
  startUp = async (accountChangeHook: (value: string) => void): Promise<string> => {
    this.selector = setupWalletSelector({
      network: this.networkId,
      modules: [setupMyNearWallet()]
    })

    const walletSelector = await this.selector
    const isSignedIn = walletSelector.isSignedIn()
    const accountId = isSignedIn ? walletSelector.store.getState().accounts[0].accountId : ''

    walletSelector.store.observable
      .pipe(
        map(state => state.accounts),
        distinctUntilChanged()
      )
      .subscribe(accounts => {
        const signedAccount = accounts.find(account => account.active)?.accountId || ''
        accountChangeHook(signedAccount)
      })

    return accountId
  }

  /**
   * Displays a modal to login the user
   */
  signIn = async () => {
    const selector = await this.selector
    const modal = setupModal(selector, { contractId: this.createAccessKeyFor, methodNames: this.methodNames })
    modal.show()
  }

  /**
   * Logout the user
   */
  signOut = async () => {
    const selector = await this.selector
    const selectedWallet = await selector.wallet()
    selectedWallet.signOut()
  }

  /**
   * Makes a read-only call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   */
  viewMethod = async <T extends Object>(params: ContractParams<T>) => {
    const { contractId, method, args = {} } = params

    const url = `https://rpc.${this.networkId}.near.org`
    const provider = new providers.JsonRpcProvider({ url })
    const res = await provider.query<any>({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic'
    })

    return JSON.parse(Buffer.from(res.result).toString())
  }

  /**
   * Makes a call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   * @param {string} options.gas - the amount of gas to use
   * @param {string} options.deposit - the amount of yoctoNEAR to deposit
   */
  callMethod = async <T extends Object>(params: ContractParams<T>) => {
    const { contractId, method, args = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT } = params

    // Sign a transaction with the "FunctionCall" action
    const selectedWallet = await (await this.selector).wallet()
    const outcome = await selectedWallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit
          }
        }
      ]
    })

    if (!outcome) return
    return providers.getTransactionLastResult(outcome)
  }

  /**
   * Makes a call to a contract
   * @param {string} txhash - the transaction hash
   */
  getTransactionResult = async (txhash: Uint8Array | string) => {
    const walletSelector = await this.selector
    const network = walletSelector.options.network
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused')
    return providers.getTransactionLastResult(transaction)
  }
}
