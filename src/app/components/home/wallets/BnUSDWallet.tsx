import React from 'react';

import BigNumber from 'bignumber.js';
import { isAddress } from 'icon-sdk-js/lib/data/Validator.js';
import { isEmpty } from 'lodash';
import { BalancedJs } from 'packages/BalancedJs';
import { useIconReact } from 'packages/icon-react';
import { Flex, Box } from 'rebass/styled-components';

import AddressInputPanel from 'app/components/AddressInputPanel';
import { Button, TextButton } from 'app/components/Button';
import CurrencyInputPanel from 'app/components/CurrencyInputPanel';
import ShouldLedgerConfirmMessage from 'app/components/DepositStakeMessage';
import Modal from 'app/components/Modal';
import { BoxPanel } from 'app/components/Panel';
import { Typography } from 'app/theme';
import bnJs from 'bnJs';
import { useChangeShouldLedgerSign, useShouldLedgerSign } from 'store/application/hooks';
import { useTransactionAdder } from 'store/transactions/hooks';
import { useWalletBalances } from 'store/wallet/hooks';

import { Grid, MaxButton } from './utils';

export default function BnUSDWallet() {
  const [value, setValue] = React.useState('');

  const shouldLedgerSign = useShouldLedgerSign();
  const changeShouldLedgerSign = useChangeShouldLedgerSign();

  const handleCurrencyInput = (value: string) => {
    setValue(value);
  };

  const [address, setAddress] = React.useState('');

  const handleAddressInput = (value: string) => {
    setAddress(value);
  };

  const { account } = useIconReact();

  const wallet = useWalletBalances();

  const maxAmount = wallet['bnUSD'];

  const handleMax = () => {
    setValue(maxAmount.toFixed());
  };

  // modal logic
  const [open, setOpen] = React.useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const beforeAmount = wallet['bnUSD'];

  const differenceAmount = isNaN(parseFloat(value)) ? new BigNumber(0) : new BigNumber(value);

  const afterAmount = beforeAmount.minus(differenceAmount);

  const addTransaction = useTransactionAdder();

  const handleSend = () => {
    if (bnJs.contractSettings.ledgerSettings.actived) {
      changeShouldLedgerSign(true);
    }

    bnJs
      .inject({ account })
      .bnUSD.transfer(address, BalancedJs.utils.toLoop(differenceAmount))
      .then((res: any) => {
        if (!isEmpty(res.result)) {
          addTransaction(
            { hash: res.result },
            {
              pending: `Sending bnUSD...`,
              summary: `Sent ${differenceAmount.dp(2).toFormat()} bnUSD.`,
            },
          );
          toggleOpen();
          setValue('');
          setAddress('');
        } else {
          // to do
          // need to handle error case
          // for example: out of balance
          console.error(res);
        }
      })
      .finally(() => {
        changeShouldLedgerSign(false);
      });
  };

  const isDisabled =
    !isAddress(address) ||
    differenceAmount.isNegative() ||
    differenceAmount.isZero() ||
    differenceAmount.isGreaterThan(maxAmount);

  return (
    <BoxPanel bg="bg3">
      <Grid>
        <Flex alignItems="center" justifyContent="space-between">
          <Typography variant="h3">Send bnUSD</Typography>
          <MaxButton onClick={handleMax}>Send max</MaxButton>
        </Flex>

        <CurrencyInputPanel
          value={value}
          showMaxButton={false}
          currency={'bnUSD'}
          onUserInput={handleCurrencyInput}
          id="bnusd-currency-input-in-bnusd-wallet"
        />

        <AddressInputPanel value={address} onUserInput={handleAddressInput} />
      </Grid>

      <Flex alignItems="center" justifyContent="center" mt={5}>
        <Button onClick={toggleOpen} disabled={isDisabled}>
          Send
        </Button>
      </Flex>

      <Modal isOpen={open} onDismiss={toggleOpen}>
        <Flex flexDirection="column" alignItems="stretch" m={5} width="100%">
          <Typography textAlign="center" mb="5px">
            Send asset?
          </Typography>

          <Typography variant="p" fontWeight="bold" textAlign="center" fontSize={20}>
            {differenceAmount.dp(2).toFormat() + ' bnUSD'}
          </Typography>

          <Typography textAlign="center" mb="2px" mt="20px">
            Address
          </Typography>

          <Typography variant="p" textAlign="center" mr="30px" ml="30px" fontSize={16}>
            {address}
          </Typography>

          <Flex my={5}>
            <Box width={1 / 2} className="border-right">
              <Typography textAlign="center">Before</Typography>
              <Typography variant="p" textAlign="center">
                {beforeAmount.dp(2).toFormat() + ' bnUSD'}
              </Typography>
            </Box>

            <Box width={1 / 2}>
              <Typography textAlign="center">After</Typography>
              <Typography variant="p" textAlign="center">
                {afterAmount.dp(2).toFormat() + ' bnUSD'}
              </Typography>
            </Box>
          </Flex>

          <Flex justifyContent="center" mt={4} pt={4} className="border-top">
            <TextButton onClick={toggleOpen} fontSize={14}>
              Cancel
            </TextButton>
            <Button onClick={handleSend} fontSize={14}>
              Send
            </Button>
          </Flex>
          {shouldLedgerSign && <ShouldLedgerConfirmMessage />}
        </Flex>
      </Modal>
    </BoxPanel>
  );
}
