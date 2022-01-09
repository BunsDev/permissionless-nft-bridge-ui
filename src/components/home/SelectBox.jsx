import React from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import dynamic from 'next/dynamic'

import { Selector, Image } from '../common/FormControls'
import { Type } from '../common/Text'
import { useMuonState } from '../../context'
import { ModalItem } from '.'
const Modal = dynamic(() => import('../common/Modal'))

const Wrapper = styled.div`
  cursor: pointer;
  width: 100%;
  margin-bottom: ${({ marginBottom }) =>
    marginBottom ? marginBottom : '20px'};
`

const ContentItem = styled(Flex)`
  box-sizing: unset !important;
  cursor: pointer;
`
const WrapToken = styled.div`
  cursor: pointer;
`
const Arrow = styled.img`
  cursor: pointer;
`

const SelectBox = (props) => {
  const {
    label,
    placeholder,
    data,
    type,
    onChange,
    value,
    marginBottom,
    border,
    borderHover
  } = props
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState('')
  const { state, dispatch } = useMuonState()

  React.useEffect(() => {
    if (value) {
      const selectedValue = data.find((item) => item.id === value)
      if (selectedValue) {
        const selectedValueIcon =
          selectedValue.symbol.charAt(0) === 'μ'
            ? selectedValue.symbol.split('-')[1].toLowerCase()
            : selectedValue.symbol.toLowerCase()
        setSelectedValue({ ...selectedValue, selectedValueIcon })
      }
    } else {
      setSelectedValue('')
    }
  }, [value])
  const contentModal =
    data &&
    data.map((item, index) => {
      if (type === 'chain') {
        return (
          <ModalItem
            key={index}
            onClick={() => {
              onChange(item)
              setOpen(!open)
            }}
          >
            <ContentItem alignItems="center">
              <Image
                src={`/media/chains/${item.symbol.toLowerCase()}.svg`}
                boxSizing="unset"
              />
              <Type.MD color="#D3DBE3" fontWeight="bold">
                {item.name}
              </Type.MD>
            </ContentItem>
          </ModalItem>
        )
      } else {
        if (item.address[state.bridge.fromChain.id]) {
          const icon =
            item.symbol.charAt(0) === 'μ'
              ? item.symbol.split('-')[1].toLowerCase()
              : item.symbol.toLowerCase()
          return (
            <ModalItem key={index}>
              <ContentItem
                alignItems="center"
                onClick={() => {
                  onChange(item)
                  setOpen(!open)
                  dispatch({
                    type: 'UPDATE_TOKEN_SEARCH_QUERY',
                    payload: ''
                  })
                }}
              >
                <Image
                  src={`/media/chains/${icon}.svg`}
                  onError={(e) => (e.target.src = '/media/tokens/default.svg')}
                  boxSizing="unset"
                />
                <WrapToken>
                  <Type.MD color="#D3DBE3" fontWeight="bold">
                    {item.symbol}
                  </Type.MD>
                  <Type.SM color="#D3DBE3" fontWeight="bold">
                    {item.name}
                  </Type.SM>
                </WrapToken>
              </ContentItem>
              <Type.MD color="#D3DBE3" fontWeight="bold">
                {item.balances[state.bridge.fromChain.id]}
              </Type.MD>
            </ModalItem>
          )
        }
      }
    })

  const handleOpenModal = () => {
    setOpen(true)
  }
  return (
    <Wrapper marginBottom={marginBottom}>
      <Type.SM color="#313144" padding="5px 10px">
        {label}
      </Type.SM>
      <Selector
        padding="0 18px 0 15px"
        onClick={handleOpenModal}
        border={border}
        borderHover={borderHover}
      >
        {selectedValue ? (
          <Flex alignItems="center">
            <Image
              src={`/media/chains/${selectedValue.selectedValueIcon}.svg`}
              onError={(e) => (e.target.src = '/media/tokens/default.svg')}
              boxSizing="unset"
            />
            <Type.MD color="#313144" cursor="pointer">
              {selectedValue.name}
            </Type.MD>
          </Flex>
        ) : (
          <Type.MD color="#919191">{placeholder ? placeholder : label}</Type.MD>
        )}

        <Arrow
          src="/media/common/arrow-down.svg"
          alt="arrow-down"
          cursor="pointer"
        />
      </Selector>

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
    </Wrapper>
  )
}

export default SelectBox
