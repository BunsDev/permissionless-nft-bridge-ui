import React, { useState } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import dynamic from 'next/dynamic'

import { Selector, Image } from '../common/FormControls'
import { Type } from '../common/Text'
import { useMuonState } from '../../context'
const Modal = dynamic(() => import('../common/Modal'))
const TokenIdModal = dynamic(() => import('../common/TokenIdModal'))
const CopyToClipboard = dynamic(() => import('react-copy-to-clipboard'))

const Wrapper = styled.div`
  cursor: pointer;
  margin-bottom: ${({ marginBottom }) => marginBottom ? marginBottom : '20px'};
`
const Item = styled.div`
  padding: 10px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  &:hover{
    background: #f8f8f8;
  }
`

const WrapToken = styled.div`
  cursor: pointer;
`
const Copy = styled.div`
    cursor: pointer;
    font-family: FH Oscar;
    font-size: 8px;
    line-height: 7px;
    color: #5551FF;
    padding: 1.5px 4px;
    background: #FFFFFF;
    border: 0.25px solid #EFEFEF;
    border-radius: 3px;
    height: 12px;
    margin-left:5px;
    &:hover{
        background:#5551FF;
        color: #FFFFFF;
    }
`

const ContractText = styled.div`
    margin-top: 10px;
    font-family: FH Oscar;
    font-size: 12.5px;
    line-height: 15px;
    color: #6F7077;
    @media screen and (max-width: 576px) {
        font-size: 10px;
    }
`

const Arrow = styled.img`
  margin-top: ${({ mt }) => (mt && mt)};
  cursor: pointer;
`

const NFTBox = ({ label, data, type, onProjectChange, unsetProject, currentNFT, currentToken, marginBottom, border, borderHover }) => {
    const [open, setOpen] = useState(false)
    const [openId, setOpenId] = useState(false)
    const defaultNFT = { name: "Asset Name", collectionName: "Collection Name", logo: "/media/nft/default.svg" }
    const { state, dispatch } = useMuonState()

    const contentModal =
        data &&
        data.map((item, index) => {
            if (item.address[state.bridge.fromChain.id]) {
                return (
                    <Item key={index} onClick={() => {
                        setOpen(!open)
                        setOpenId(!openId)
                        onProjectChange(item)
                    }}>
                        <Image
                            src={`/media/nft/${item.logo}`}
                            onError={(e) => (e.target.src = '/media/tokens/default.svg')}
                            height="60px"
                            width="60px"
                            paddingRight="0"
                            borderRadius="5px"
                        />
                        <WrapToken>
                            <Type.LG
                                fontFamily="FH Oscar"
                                color="#313144"
                                fontSizeXS="16px"
                                cursor="pointer"
                            >
                                {item.name}
                            </Type.LG>
                        </WrapToken>
                    </Item >
                )
            }
        })

    const handleOpenModal = () => {
        currentNFT ? setOpenId(true) : setOpen(true)
    }
    return (
        <Wrapper marginBottom={marginBottom}>
            <Type.SM
                fontFamily="FH Oscar"
                color="#313144"
                fontSize="12.5px"
                padding="5px 10px"
            >
                {label}
            </Type.SM>
            <Selector
                alignItems="flex-start"
                height="unset"
                padding="15px 21px 16px 16px"
                onClick={handleOpenModal}
                border={border}
                borderHover={borderHover}
            >
                <Flex alignItems="flex-start" >
                    <Image
                        width={"89px"}
                        height={"89px"}
                        src={`${currentToken?.logo ? currentToken.logo : defaultNFT.logo}`}
                        // onError={(e) => (e.target.src = currentToken ? currentNFT.logo : defaultNFT.icon)}
                        boxSizing="unset"
                        borderRadius="5px"
                        paddingRight="0"
                    />
                    <div style={{ marginLeft: "21px" }}>
                        <Type.LG fontFamily="FH Oscar" color="#313144" cursor="pointer" fontSizeXS="16px">
                            {currentToken ? currentToken.name ? currentToken.name : `${currentNFT.symbol} #${currentToken.id}` : defaultNFT.name}
                        </Type.LG>
                        <Type.MD fontFamily="FH Oscar" color="#6F7077" cursor="pointer" fontSizeXS="16px">
                            {currentToken ? currentNFT.name : defaultNFT.collectionName}
                        </Type.MD>
                    </div>
                </Flex>

                <Arrow
                    mt="8px"
                    src="/media/common/arrow-down.svg"
                    alt="arrow-down"
                    cursor="pointer"
                />

            </Selector>

            {currentToken && currentNFT && <Flex alignItems="flex-end" justifyContent="space-between" mx="15px">
                <ContractText>{currentNFT.name} Contract <br /> {currentNFT.address[state.bridge.fromChain.id]}  </ContractText>
                <CopyToClipboard text={currentNFT.address[state.bridge.fromChain.id]}  >
                    <Copy >COPY</Copy>
                </CopyToClipboard>
            </Flex>}



            <Modal
                open={open}
                hide={() => {
                    setOpen(!open)
                    dispatch({
                        type: 'UPDATE_TOKEN_SEARCH_QUERY',
                        payload: ''
                    })
                }}
                title={label}
                search={type === 'token'}
                placeholderSearch="Search name or paste address"
            >
                {contentModal}
            </Modal>

            <TokenIdModal
                open={openId ? true : false}
                hide={() => {
                    setOpenId(!openId)
                }}
                title={"Enter TokenIDs for " + currentNFT?.name}
                search={type === 'token'}
                bottomAction={() => {
                    unsetProject()
                    setOpenId(false)
                    setOpen(true)
                }}
                bottomActionText={<div>&#8249; Back</div>}
                placeholderSearch="1,2,3"
            >
            </TokenIdModal>


        </Wrapper>
    )
}

export default NFTBox
