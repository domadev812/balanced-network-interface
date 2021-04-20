import React from 'react';

import { useIconReact } from 'packages/icon-react';
import ClickAwayListener from 'react-click-away-listener';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { IconButton, Button } from 'app/components/Button';
import { Link } from 'app/components/Link';
import Logo from 'app/components/Logo';
import { DropdownPopper } from 'app/components/Popover';
import WalletModal from 'app/components/WalletModal';
import { Typography } from 'app/theme';
import { ReactComponent as WalletIcon } from 'assets/icons/wallet.svg';
import { useWalletModalToggle } from 'store/application/hooks';
import { shortenAddress } from 'utils';

const StyledLogo = styled(Logo)`
  margin-right: 75px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-right: 15px;
  `}
`;

const WalletInfo = styled(Box)`
  text-align: right;
  margin-right: 15px;
  min-height: 42px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;

const WalletButtonWrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;

const WalletMenu = styled.div`
  max-width: 160px;
  font-size: 14px;
  padding: 25px;
  display: grid;
  grid-template-rows: auto;
  grid-gap: 20px;
`;

const WalletMenuButton = styled(Button)`
  padding: 7px 25px;
`;

const ChangeWalletButton = styled(Link)`
  cursor: pointer;
`;

export default React.memo(function Header(props: { title?: string; className?: string }) {
  const { className, title } = props;

  const { account, disconnect } = useIconReact();

  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const walletButtonRef = React.useRef<HTMLElement>(null);
  const toggleWalletMenu = () => {
    setAnchor(anchor ? null : walletButtonRef.current);
  };
  const closeWalletMenu = () => setAnchor(null);

  const toggleWalletModal = useWalletModalToggle();

  const handleChangeWallet = () => {
    closeWalletMenu();
    toggleWalletModal();
  };

  const handleDisconnectWallet = () => {
    closeWalletMenu();
    disconnect();
  };

  return (
    <header className={className}>
      <Flex justifyContent="space-between">
        <Flex alignItems="center">
          <StyledLogo />
          <Typography variant="h1">{title}</Typography>
        </Flex>

        {!account && (
          <Flex alignItems="center">
            <Button onClick={toggleWalletModal}>Sign in</Button>
          </Flex>
        )}

        {account && (
          <Flex alignItems="center">
            <WalletInfo>
              <Typography variant="p" textAlign="right">
                Wallet
              </Typography>
              {account && <Typography>{shortenAddress(account)}</Typography>}
            </WalletInfo>

            <WalletButtonWrapper>
              <ClickAwayListener onClickAway={closeWalletMenu}>
                <div>
                  <IconButton ref={walletButtonRef} onClick={toggleWalletMenu}>
                    <WalletIcon />
                  </IconButton>

                  <DropdownPopper show={Boolean(anchor)} anchorEl={anchor} placement="bottom-end">
                    <WalletMenu>
                      <ChangeWalletButton onClick={handleChangeWallet}>Change wallet</ChangeWalletButton>
                      <WalletMenuButton onClick={handleDisconnectWallet}>Sign out</WalletMenuButton>
                    </WalletMenu>
                  </DropdownPopper>
                </div>
              </ClickAwayListener>
            </WalletButtonWrapper>
          </Flex>
        )}
      </Flex>

      <WalletModal />
    </header>
  );
});
