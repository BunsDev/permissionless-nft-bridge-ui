import React from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import dynamic from 'next/dynamic'

import { Selector, Image } from '../common/FormControls'
import { Type } from '../common/Text'
import { useMuonState } from '../../context'
const Modal = dynamic(() => import('../common/Modal'))

const Wrapper = styled.div`
  cursor: pointer;
  margin-bottom: ${({ marginBottom }) =>
    marginBottom ? marginBottom : '20px'};
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
          <Item key={index} onClick={() => {
            onChange(item)
            setOpen(!open)
          }}>
            <ContentItem
              alignItems="center"
            >
              <Image
                src={`/media/chains/${item.symbol.toLowerCase()}.svg`}
                boxSizing="unset"
              />
              <Type.LG
                color="#313144"
                fontSizeXS="16px"
              >
                {item.name}
              </Type.LG>
            </ContentItem>
          </Item>
        )
      } else {
        if (item.address[state.bridge.fromChain.id]) {
          const icon =
            item.symbol.charAt(0) === 'μ'
              ? item.symbol.split('-')[1].toLowerCase()
              : item.symbol.toLowerCase()
          return (
            <Item key={index}>
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
                  <Type.LG
                    color="#313144"
                    fontSizeXS="16px"
                    cursor="pointer"
                  >
                    {item.symbol}
                  </Type.LG>
                  <Type.SM
                    fontSize="12.5px"
                    color="#909090"
                    cursor="pointer"
                  >
                    {item.name}
                  </Type.SM>
                </WrapToken>
              </ContentItem>
              <Type.LG fontFamily="FH Oscar" color="#313144" fontSizeXS="16px">
                {item.balances[state.bridge.fromChain.id]}
              </Type.LG>
            </Item>
          )
        }
      }
    })

  const handleOpenModal = () => {
    setOpen(true)
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
            <Type.LG
              color="#313144"
              cursor="pointer"
              fontSizeXS="16px"
            >
              {selectedValue.name}
            </Type.LG>
          </Flex>
        ) : (
          <Type.LG
            color="#919191"
            fontSizeXS="16px"
            fontSizeXXS="14px"
          >
            {placeholder ? placeholder : label}
          </Type.LG>
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
