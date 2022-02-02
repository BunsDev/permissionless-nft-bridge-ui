import { isObject } from 'lodash';
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import styled from 'styled-components';
import { getOwnedTokens } from '../../helper/Tokens';
import { Image } from '../common/FormControls';
import { CheckCircle, Circle } from 'react-feather';
import { Type } from '../common/Text';
import { useMuonState } from '../../context';
import { useWeb3React } from '@web3-react/core';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-bottom: ${({ marginBottom }) =>
    marginBottom ? marginBottom : '20px'};
`

const WrapToken = styled.div`
  cursor: pointer;
`
const CheckCircleWrapper = styled.div`
  display: inline-block;
  vertical-align: middle;
  padding-left: 5px;
`
const Arrow = styled.img`
  cursor: pointer;
`
const FetchingData = styled.span`
  display: flex;
  justify-content: center;
  font-size: 30px;
  padding: 20px 0;
  font-weight: 200;
`

export const OptionWrapper = styled.div`
  background: #2b2b3c;
  border: 1px solid rgba(172, 175, 243, 0.29);
  margin: auto;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  &:hover {
    background: #42425f;
  }
`

const NFTDropDown = (props) => {
  const {
    label,
    marginBottom,
    border
  } = props;

  const { state } = useMuonState();
  const { account } = useWeb3React();
  const [tokenUris, setTokenUris] = useState({});
  const [selectedTokenIds, setSelectedTokenIds] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [placeholder, setPlaceholder] = useState('1,2,3,...');
  const [options, setOptions] = useState([]);

  const resetOptionsForLoading = () => {
    setFetchingData(true);
    setSelectedTokenIds([]);
    setTokenUris({});
    setOptions([]);
  }

  useEffect(async () => {
    resetOptionsForLoading();
    if(state.bridge.token && account)
    {
      let tokens = await getOwnedTokens(account, 
        state.bridge.fromChain, 
        state.bridge.token.address[state.bridge.fromChain.id]);
      if(isObject(tokens))
      {
        setTokenUris(tokens);
      }
      setFetchingData(false);
    }
  }, [state.bridge.token, state.bridge.fromChain]);

  const Menu = (props) => {
    return (
      <components.Menu {...props}>
          {fetchingData ? (
            <FetchingData>Load NFTs...</FetchingData>
          ) : (
            props.children
          )}
      </components.Menu>
    );
  };

  const NFTOption = (props) => {
    const {
      imageUrl,
      tokenId,
      isSelected,
    } = props;

    return (
      <OptionWrapper >
        <Image
          src={imageUrl}
          onError={(e) => (e.target.src = '/media/tokens/default.svg')}
          height="40px"
          width="40px"
          paddingRight="0"
          borderRadius="5px"
        />
        <WrapToken >
          <Type.MD color="#D3DBE3" cursor="pointer">
            #{tokenId}  
            <CheckCircleWrapper>
              {
                !isSelected?(
                  <Circle size={16} />
                ):(
                  <CheckCircle size={16} />
                )
              }
            </CheckCircleWrapper>
          </Type.MD>
        </WrapToken>
      </OptionWrapper>
    );
  }

  const Placeholder = (props) => {
    return (
      <components.Placeholder {...props} >
        <Type.MD color="#919191">{fetchingData?"Load NFTs...":placeholder}</Type.MD>
      </components.Placeholder>
    );
  };

  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <Arrow
          src="/media/common/arrow-down.svg"
          alt="arrow-down"
          cursor="pointer"
        />
      </components.DropdownIndicator>
    );
  };

  const IndicatorSeparator = (props) => {
    return null;
  }

  const handleSelectToken = (selectedOptions, event) => {
    let tokenId = event.option.value;
    if(!selectedTokenIds.includes(tokenId))
    {
      setSelectedTokenIds(selectedTokenIds => [...selectedTokenIds, tokenId]);
    }else
    {
      for(var i = 0; i < selectedTokenIds.length; i++)
      { 
        if(selectedTokenIds[i] === tokenId)
        {
          setSelectedTokenIds([
            ...selectedTokenIds.slice(0, i),
            ...selectedTokenIds.slice(i + 1)
          ]);
        }
      }
    }
  };

  const sortOptions = (options) => {
    if(options.length > 0)
    {
      let selectedOptions = [];
      let unSelectedOptions = [];
      options.map((item) => {
        if(selectedTokenIds.includes(item.value))
        {
          selectedOptions.push(item);
        }else
        {
          unSelectedOptions.push(item);
        }
      });
      let sortedSelectedOptions = selectedOptions.sort(
        (option1, option2) => option1.value<option2.value?-1:1
        );
      let sortedUnselectedOptions = unSelectedOptions.sort(
        (option1, option2) => option1.value<option2.value?-1:1
        );
      return [...sortedSelectedOptions, ...sortedUnselectedOptions];
    }
  };

  useEffect(() => {
    let newOptions = [];
    if(tokenUris)
    {
      newOptions = Object.keys(tokenUris).map((tokenId) => {
        var item = {};
        item.value = tokenId;
        item.label = (
          <NFTOption 
            imageUrl={tokenUris[tokenId].image}
            tokenId={tokenId}
            isSelected={
              selectedTokenIds.find(
                (selectedToken) => selectedToken == tokenId
                )!==undefined}

          />
        )
        return item;
      });
    }
    setOptions(sortOptions(newOptions));
  }, [tokenUris, selectedTokenIds]);

  useEffect(() => {
    if(selectedTokenIds.length > 0)
    {
      setPlaceholder(selectedTokenIds.join(","));
    }else
    {
      setPlaceholder('1,2,3,...');
    }
  }, [selectedTokenIds])

  const customStyles = {
    control: (base) => ({
      ...base,
      background: '#E6ECF2',
      borderRadius: '5px',
      height: '45px',
      border: border?border:'1px solid #FFFFFF',
      padding: '0 10px 0 7px',
      color: '#919191',
      cursor: 'inherit',
      '&:focus': {
        outline: 'none',
      },
      '&:hover': {
        filter: 'brightness(0.9)',
        outline: 'none',
        border: 'none'
      }
    }),
    indicatorsContainer: (base) => ({
      ...base,
      textAlign: 'left'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#E6ECF2'
    }),
    option: (base) => ({
      ...base,
      backgroundColor: "",
      padding: "2px",
    })
  }

  return (
    <Wrapper marginBottom={marginBottom}>
      <Type.SM color="#313144" fontSize="12.5px" padding="5px 10px">
        {label}
      </Type.SM>
      <Select
        className='NFT-Select'
        classNamePrefix="NFT-select"
        options={options}
        components={
          { 
            Placeholder, 
            DropdownIndicator,
            IndicatorSeparator
          }
        }
        isMulti
        controlShouldRenderValue={false}
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        backspaceRemovesValue={false}
        isClearable={false}
        styles={customStyles}
        closeMenuOnScroll={true}
        onChange={handleSelectToken}
      />
    </Wrapper>
  );
}

export default NFTDropDown;
