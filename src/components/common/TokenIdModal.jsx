import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { Type } from './Text'
import { BorderBottom, ImageWithCursor, Input } from './FormControls'
import { useMuonState } from '../../context'

if (typeof window !== 'undefined') {
  ReactModal.setAppElement('body')
}

const BottomButton = styled.div`
  cursor: pointer;
  &:hover {
    *{
      color: #5551ff;
    }
  }
`
const ConfirmButton = styled.div`
  padding:5px 10px;
  border-radius: 5px;
  background: ${({ active }) => (active ? "#5F5CFE" : "#D7D7D7")};
  cursor: ${({ active }) => (active ? "pointer" : "default")};
  color:${({ active }) => (active ? '#ffffff' : '#909090')};
`


const Modal = (props) => {
  const {
    open,
    hide,
    title,
    search,
    placeholderSearch,
    maxWidth,
    backgroundColor,
    border,
    borderRadius,
    padding,
    boxShadowColor,
    bottomActionText,
    bottomAction,
  } = props

  const { dispatch } = useMuonState()
  const [tokenId, setTokenId] = useState(null)
  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: maxWidth ? maxWidth : '450px',
      width: '95%',
      background: backgroundColor ? backgroundColor : '#ffffff',
      border: border ? border : '0.5px solid #D2D2D2',
      borderRadius: borderRadius ? borderRadius : '20px',
      overFlowY: 'hidden',
      boxSizing: 'border-box',
      boxShadow: `0px 4px 4px ${boxShadowColor ? boxShadowColor : 'rgba(239, 239, 239, 0.25)'
        }`
    }
  }

  const handleSearch = (data) => {
    setTokenId(data)
  }

  const onConfirm = () => {
    hide()
    dispatch({
      type: 'UPDATE_NFT_ID',
      payload: tokenId
    })
    setTokenId(null)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onConfirm()
    }
  }

  return (
    <ReactModal
      isOpen={open}
      style={customStyles}
      onRequestClose={hide}
      shouldCloseOnOverlayClick={true}
    >
      <Flex flexDirection="column">
        <Flex
          justifyContent="space-between"
          alignItems="center"
          padding={padding ? padding : '30px 30px 25px'}
        >
          <Type.LG fontFamily="FH Oscar" color="#313144" fontSizeXS="16px">
            {title}
          </Type.LG>
          <ImageWithCursor
            width="12.5px"
            height="12.5px"
            paddingRight="0"
            src="/media/common/x.svg"
            onClick={hide}
          />
        </Flex>
        {search && (
          <Flex
            justifyContent="center"
            alignItems="center"
            padding="0 25px 30px"
            onKeyPress={(e) => handleKeyPress(e)}
          >
            <Input
              autoFocus={true}
              placeholder={placeholderSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Flex>
        )}
        <BorderBottom />
      </Flex>

      {bottomActionText && <Flex
        justifyContent="space-between"
        alignItems="center"
        padding="15px 25px 17px"
      >
        <BottomButton onClick={bottomAction} style={{ cursor: "pointer" }}>
          <Type.LG color="#313144" fontSizeXS="16px">
            {bottomActionText}
          </Type.LG>
        </BottomButton>

        <ConfirmButton active={tokenId} onClick={() => onConfirm()} style={{ cursor: "pointer" }}>
          <Type.LG fontSizeXS="16px">
            Confirm
          </Type.LG>
        </ConfirmButton>
      </Flex>}


    </ReactModal>
  )
}

export default Modal
