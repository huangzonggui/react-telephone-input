import R from 'cramda';
import VirtualList from 'react-tiny-virtual-list';

import debounce from 'debounce';
import memoize from 'lodash.memoize';

import * as React from 'react';
import { Component } from 'react';
import classNames from 'classnames';
import enhanceWithClickOutside from 'react-click-outside';
import countryData from 'country-telephone-data';
import formatNumber from './format_number';
import replaceCountryCode from './replace_country_code';
import isNumberValid from './number_validator';
import guessSelectedCountry from './guessSelectedCountry';

type Direction = 1 | -1;
type ISO2Name = string;

export interface Country {
  name?: string;
  iso2?: ISO2Name;
  dialCode: string;
  priority: number;
  format?: string;
}

interface DefaultProps {
  autoFormat: boolean;
  onlyCountries: Array<Country>;
  defaultCountry: ISO2Name;
  isValid: (inputNumber: string) => boolean;
  flagsImagePath: string;
  onEnterKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  preferredCountries: Array<ISO2Name>;
  disabled: boolean;
  placeholder: string;
  autoComplete: string; // TODO: find the exact list of acceptable strings
  required: boolean;
  inputProps: React.HTMLProps<HTMLInputElement>;
  buttonProps: React.HTMLProps<HTMLButtonElement>;
  listItemClassName: string;
  listStyle: React.CSSProperties;
  reactTelInputStyle: React.CSSProperties;
  inputHeight?: number;
  selectedFlag?: number;
  dialCodeWidth?: number;
  inputFormControlStyle?: React.CSSProperties;
}

export type Props = {
  value?: string;
  initialValue?: string;
  initialDialCode?: string;
  classNames: string;
  className: string;
  inputId: string;
  // onChange: (inputNumber: string, selectedCountry: Country) => void;
  // onFocus?: (inputNumber: string, selectedCountry: Country) => void;
  // onBlur?: (inputNumber: string, selectedCountry: Country) => void;

  onChange: (inputNumber: string, dialCode: string) => void;
  onFocus?: (inputNumber: string, dialCode: string) => void;
  onBlur?: (inputNumber: string, dialCode: string) => void;
  pattern: string;
} & DefaultProps;

const { find, propEq, equals, findIndex, startsWith } = R;

const { allCountries, iso2Lookup } = countryData;
let isModernBrowser = true;

if (typeof document !== 'undefined') {
  isModernBrowser = Boolean(document.createElement('input').setSelectionRange);
} else {
  isModernBrowser = true;
}

const keys = {
  UP: 38,
  DOWN: 40,
  RIGHT: 39,
  LEFT: 37,
  ENTER: 13,
  ESC: 27,
  PLUS: 43,
  A: 65,
  Z: 90,
  SPACE: 32,
};

function getDropdownListWidth() {
  const defaultWidth = 400;
  const horizontalMargin = 20;

  if (window.innerWidth - horizontalMargin < defaultWidth) {
    return window.innerWidth - horizontalMargin;
  } else {
    return defaultWidth;
  }
}

interface State {
  firstCall: boolean;
  preferredCountries: Array<Country>;
  showDropDown: boolean;
  queryString: string;
  freezeSelection: boolean;
  debouncedQueryStingSearcher: () => void;
  selectedCountry?: Country;
  dialCode: string;
  highlightCountryIndex: number;
  formattedNumber: string;
}

export class ReactTelephoneInput extends Component<Props, State> {
  static defaultProps = {
    autoFormat: true,
    onlyCountries: allCountries,
    defaultCountry: allCountries[0].iso2,
    isValid: isNumberValid,
    flagsImagePath: 'flags.png',
    onEnterKeyPress() { },
    preferredCountries: [],
    disabled: false,
    placeholder: '',
    autoComplete: 'tel',
    required: false,
    inputProps: {},
    buttonProps: {},
    listItemClassName: 'country',
    listStyle: {
      zIndex: 20,
      backgroundColor: 'white',
    },
    initialDialCode: ''
  };

  numberInputRef: HTMLInputElement | null = null;

  constructor(props: Props) {
    super(props);

    // eslint-disable-next-line
    const preferredCountriesFromProps = props.preferredCountries;

    const preferredCountries = preferredCountriesFromProps
      .map((iso2) =>
        Object.prototype.hasOwnProperty.call(iso2Lookup, iso2)
          ? allCountries[iso2Lookup[iso2]]
          : null,
      )
      .filter((val) => val !== null);

    this.state = {
      firstCall: true,
      preferredCountries,
      showDropDown: false,
      queryString: '',
      freezeSelection: false,
      debouncedQueryStingSearcher: debounce(this.searchCountry, 600),
      formattedNumber: '',
      highlightCountryIndex: 0,
      dialCode: ''
    };
  }

  componentDidMount() {
    this._cursorToEnd(true);

    if (this.props.initialDialCode) {
      this.setState({
        dialCode: this.props.initialDialCode
      })
    } else {
      this.setState({
        dialCode: this.props.onlyCountries[0].dialCode ? this.props.onlyCountries[0].dialCode : ''
      })
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !equals(nextProps, this.props) || !equals(nextState, this.state);
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    let inputNumber;
    let inputDialCode = '';
    const { onlyCountries } = props;
    const { showDropDown, preferredCountries, selectedCountry } = state;

    // don't calculate new state if the dropdown is open. We might be changing
    // the highlightCountryIndex using our keys
    if (showDropDown) {
      return state;
    }


    console.log('props.value :>> ', props.value);
    console.log('props.initalValue :>> ', props.initialValue);
    console.log('state.firstCall :>> ', state.firstCall);
    if (props.value) {
      console.log('111111');
      inputNumber = props.value;
    } else if (props.initialValue && state.firstCall) {
      console.log('222222');
      inputNumber = props.initialValue;
    } else if (props.value === null || props.value === '') {
      console.log('333333');
      // just clear the value
      inputNumber = '';
    } else if (
      state &&
      state.formattedNumber &&
      state.formattedNumber.length > 0
    ) {
      console.log('555555');
      inputNumber = state.formattedNumber;
    } else {
      console.log('666666');
      inputNumber = '';
    }

    let selectedCountryGuess = guessSelectedCountry(
      inputNumber.replace(/\D/g, ''),
      props,
    );

    // if the guessed country has the same dialCode as the selected country in
    // our state, we give preference to the already selected country
    if (
      selectedCountry &&
      selectedCountryGuess.dialCode === selectedCountry.dialCode
    ) {
      selectedCountryGuess = selectedCountry;
    }

    // inputDialCode = selectedCountry.dialCode
    //  else if (props.initialDialCode) {
    //   inputDialCode = props.initialDialCode
    // } else if (props.onlyCountries[0]?.dialCode) {
    //   inputDialCode = props.onlyCountries[0].dialCode
    // }

    // const dialCode = inputDialCode
    const selectedCountryGuessIndex = findIndex(
      propEq('iso2', selectedCountryGuess.iso2),
      preferredCountries.concat(onlyCountries),
    );

    console.log('selectedCountry :>> ', selectedCountry);
    const formattedNumber = inputNumber.replace(/\D/g, '');
    // const formattedNumber = formatNumber(
    //   inputNumber.replace(/\D/g, ''),
    //   selectedCountryGuess && selectedCountryGuess.format
    //     ? selectedCountryGuess.format
    //     : null,
    //   props.autoFormat,
    // );

    return {
      firstCall: false,
      selectedCountry: selectedCountryGuess,
      highlightCountryIndex: selectedCountryGuessIndex,
      formattedNumber,
      // dialCode,
    };
  }

  // put the cursor to the end of the input (usually after a focus event)
  _cursorToEnd = (skipFocus = false) => {
    const input = this.numberInputRef;
    if (skipFocus) {
      this._fillDialCode();
    } else {
      if (input) {
        input.focus();
      }

      if (isModernBrowser && input) {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }
  };

  handleFlagDropdownClick = (e: React.SyntheticEvent) => {
    if (this.props.disabled) {
      return;
    }

    e.preventDefault();
    const { preferredCountries } = this.state;
    // const selectedCountry = this.state.selectedCountry!;
    const { onlyCountries } = this.props;

    const highlightCountryIndex = findIndex(
      // propEq('iso2', selectedCountry.iso2),
      propEq('dialCode', this.state.dialCode),
      preferredCountries.concat(onlyCountries),
    );

    // need to put the highlight on the current selected country if the dropdown is going to open up
    this.setState({
      showDropDown: !this.state.showDropDown,
      highlightCountryIndex,
    });
  };

  handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // let formattedNumber = '+';
    let formattedNumber = '';
    // let newSelectedCountry = this.state.selectedCountry!;
    let { freezeSelection } = this.state;

    // if the input is the same as before, must be some special key like enter, alt, command etc.
    if (event.target.value === this.state.formattedNumber) {
      return;
    }

    if (event.preventDefault) {
      event.preventDefault();
      event.nativeEvent.preventDefault();
    }

    if (event.target.value && event.target.value.length > 0) {
      // before entering the number in new format,
      // lets check if the dial code now matches some other country
      // replace all non-numeric characters from the input string
      const inputNumber = event.target.value.replace(/\D/g, '');

      // we don't need to send the whole number to guess the country...
      // only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively
      // since the set of input it gets has drastically reduced
      if (
        !this.state.freezeSelection
        // ||
        // newSelectedCountry.dialCode.length > inputNumber.length
      ) {
        // newSelectedCountry = guessSelectedCountry(
        //   inputNumber.substring(0, 6),
        //   this.props,
        // );
        freezeSelection = false;
      }
      formattedNumber = inputNumber
      // formatNumber(
      // inputNumber,
      // newSelectedCountry && newSelectedCountry.format
      //   ? newSelectedCountry.format
      //   : null,
      //   this.props.autoFormat,
      // );
    }

    let caretPosition: number = event.target.selectionStart || 0;
    const oldFormattedText = this.state.formattedNumber;
    const diff = formattedNumber.length - oldFormattedText.length;
    // const selectedCountry =
    //   newSelectedCountry.dialCode.length > 0
    //     ? newSelectedCountry
    //     : this.state.selectedCountry!;

    this.setState(
      {
        formattedNumber,
        freezeSelection,
        // selectedCountry,
      },
      () => {
        if (isModernBrowser) {
          if (caretPosition === 1 && formattedNumber.length === 2) {
            caretPosition += 1;
          }

          if (diff > 0) {
            caretPosition -= diff;
          }

          if (
            caretPosition > 0 &&
            oldFormattedText.length >= formattedNumber.length
          ) {
            if (this.numberInputRef) {
              this.numberInputRef.setSelectionRange(
                caretPosition,
                caretPosition,
              );
            }
          }
        }

        if (this.props.onChange) {
          // this.props.onChange(formattedNumber, this.state.selectedCountry!);
          this.props.onChange(formattedNumber, this.state.dialCode!);
        }
      },
    );
  };

  handleInputClick = () => {
    this.setState({ showDropDown: false });
  };

  handleFlagItemClick = (country: Country) => {
    const { onlyCountries } = this.props;
    const currentSelectedCountry = this.state.selectedCountry!;
    const nextSelectedCountry = find(
      (c: Country) => c.iso2 === country.iso2,
      onlyCountries,
    );

    // tiny optimization
    if (
      nextSelectedCountry
      // && currentSelectedCountry.iso2 !== nextSelectedCountry.iso2
    ) {
      // const newNumber = replaceCountryCode(
      //   currentSelectedCountry,
      //   nextSelectedCountry,
      //   this.state.formattedNumber.replace(/\D/g, ''), // let's convert formatted number to just numbers for easy find/replace
      // );

      // const formattedNumber = formatNumber(
      //   newNumber,
      //   nextSelectedCountry.format,
      //   this.props.autoFormat,
      // );

      this.setState(
        {
          showDropDown: false,
          selectedCountry: nextSelectedCountry,// not work
          freezeSelection: true,
          // formattedNumber: this.state.formattedNumber,
          dialCode: nextSelectedCountry.dialCode
        },
        () => {
          this._cursorToEnd();
          // setTimeout(() => {
          //   console.log('this.state :>> ', this.state);
          // }, 3000)
          if (this.props.onChange) {
            // this.props.onChange(this.state.formattedNumber, nextSelectedCountry);
            this.props.onChange(this.state.formattedNumber, nextSelectedCountry.dialCode);
          }
        },
      );
    } else {
      this.setState({ showDropDown: false });
    }
  };

  handleInputFocus = () => {
    // trigger parent component's onFocus handler
    if (typeof this.props.onFocus === 'function') {
      this.props.onFocus(
        this.state.formattedNumber,
        // this.state.selectedCountry!,
        this.state.dialCode!,
      );
    }

    this._fillDialCode();
  };

  _fillDialCode = () => {
    const selectedCountry = this.state.selectedCountry!;

    // if the input is blank, insert dial code of the selected country
    if (this.numberInputRef && this.numberInputRef.value === '+') {
      this.setState({
        // formattedNumber: `+${selectedCountry.dialCode}`,
      });
    }
  };

  _getHighlightCountryIndex = (direction: Direction) => {
    const { onlyCountries } = this.props;
    const { highlightCountryIndex, preferredCountries } = this.state;

    // had to write own function because underscore does not have findIndex. lodash has it
    const newHighlightCountryIndex = highlightCountryIndex + direction;

    if (
      newHighlightCountryIndex < 0 ||
      newHighlightCountryIndex >=
      onlyCountries.length + preferredCountries.length
    ) {
      return newHighlightCountryIndex - direction;
    }

    return newHighlightCountryIndex;
  };

  // memoize search results... caching all the way
  _searchCountry = memoize((queryString) => {
    const { onlyCountries } = this.props;
    if (!queryString || queryString.length === 0) {
      return null;
    }
    // don't include the preferred countries in search
    const probableCountries = onlyCountries.filter(
      (country: Country) =>
        country.name
          ? startsWith(queryString.toLowerCase(), country.name.toLowerCase())
          : false,
      this,
    );
    return probableCountries[0];
  });

  searchCountry = () => {
    const { onlyCountries } = this.props;

    const probableCandidate =
      this._searchCountry(this.state.queryString) || onlyCountries[0];
    const probableCandidateIndex =
      findIndex(
        propEq('iso2', probableCandidate.iso2),
        this.props.onlyCountries,
      ) + this.state.preferredCountries.length;

    this.setState({
      queryString: '',
      highlightCountryIndex: probableCandidateIndex,
    });
  };

  handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { onlyCountries } = this.props;

    if (!this.state.showDropDown || event.metaKey || event.altKey) {
      return;
    }

    // ie hack
    if (event.preventDefault) {
      event.preventDefault();
      event.nativeEvent.preventDefault();
    }

    const _moveHighlight = (direction: Direction) => {
      const highlightCountryIndex = this._getHighlightCountryIndex(direction);

      this.setState({
        highlightCountryIndex,
      });
    };

    switch (event.which) {
      case keys.DOWN:
        _moveHighlight(1);
        break;
      case keys.UP:
        _moveHighlight(-1);
        break;
      case keys.ENTER:
        this.handleFlagItemClick(
          this.state.preferredCountries.concat(onlyCountries)[
          this.state.highlightCountryIndex
          ],
        );
        break;
      case keys.ESC:
        this.setState({ showDropDown: false }, this._cursorToEnd);
        break;
      default:
        if (
          (event.which >= keys.A && event.which <= keys.Z) ||
          event.which === keys.SPACE
        ) {
          this.setState(
            {
              queryString:
                this.state.queryString + String.fromCharCode(event.which),
            },
            this.state.debouncedQueryStingSearcher,
          );
        }
    }
  };

  handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.which === keys.ENTER &&
      typeof this.props.onEnterKeyPress === 'function'
    ) {
      this.props.onEnterKeyPress(event);
    }
  };

  handleClickOutside = () => {
    if (this.state.showDropDown) {
      this.setState({
        showDropDown: false,
      });
    }
  };

  getCountryDropDownList = () => {
    const { onlyCountries } = this.props;

    const { highlightCountryIndex, preferredCountries } = this.state;
    const data = preferredCountries.concat(onlyCountries);
    const countryListStyle = this.props.inputHeight ? { top: this.props.inputHeight - 2 } : {}

    return (
      <VirtualList
        width={getDropdownListWidth()}
        height={300}
        itemCount={data.length}
        itemSize={40}
        style={{ ...this.props.listStyle, ...countryListStyle }}
        className="country-list"
        scrollToIndex={highlightCountryIndex}
        scrollToAlignment={'center' as any}
        renderItem={({ index, style }) => {
          const country = data[index];
          const itemClasses = classNames(this.props.listItemClassName, {
            preferred:
              findIndex(
                propEq('iso2', country.iso2),
                this.state.preferredCountries,
              ) >= 0,
            highlight: this.state.highlightCountryIndex === index,
          });

          const inputFlagClasses = `flag ${country.iso2}`;

          return (
            <div
              key={`flag_no_${index}`}
              data-flag-key={`flag_no_${index}`}
              className={itemClasses}
              data-dial-code={country.dialCode}
              data-country-code={country.iso2}
              onClick={this.handleFlagItemClick.bind(this, country)}
              style={style}
              title={`${country.name} - ${country.dialCode}`}
              data-test-id="src_reacttelephoneinput_test_id_0"
            >
              {/* <div
                className={inputFlagClasses}
                style={this.getFlagStyle()}
                data-test-id="src_reacttelephoneinput_test_id_1"
              /> */}
              <span
                className="country-name"
                data-test-id="src_reacttelephoneinput_test_id_2"
              >
                {country.name}
              </span>
              <span
                className="dial-code"
                data-test-id="src_reacttelephoneinput_test_id_3"
              >{`+${country.dialCode}`}</span>
            </div>
          );
        }}
      />
    );
  };

  getFlagStyle = () => {
    if (this.props.flagsImagePath) {
      return {
        backgroundImage: `url(${this.props.flagsImagePath})`,
      };
    }
    return {};
  };

  handleInputBlur = () => {
    // const selectedCountry = this.state.selectedCountry!;

    if (typeof this.props.onBlur === 'function') {
      this.props.onBlur(this.state.formattedNumber, this.state.dialCode);
    }
  };

  handleFlagKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // only trigger dropdown click if the dropdown is not already open.
    // it will otherwise interfere with key up/down of list
    if (event.which === keys.DOWN && this.state.showDropDown === false) {
      this.handleFlagDropdownClick(event);
    }
  };

  render() {
    const { isValid } = this.props;
    const selectedCountry = this.state.selectedCountry!;

    const arrowClasses = classNames({
      arrow: true,
      up: this.state.showDropDown,
    });
    const inputClasses = classNames({
      'form-control': true,
      'invalid-number': !isValid(this.state.formattedNumber.replace(/\D/g, '')),
    });

    const flagViewClasses = classNames({
      'flag-dropdown': true,
      'open-dropdown': this.state.showDropDown,
    });

    // const inputFlagClasses = `flag ${selectedCountry.iso2}`;
    const inputFlagClasses = `flag`;
    const { buttonProps } = this.props;
    const otherProps = this.props.inputProps;
    if (otherProps && this.props.inputId) {
      otherProps.id = this.props.inputId;
    }

    const inputHeightStyle = this.props.inputHeight ? { height: this.props.inputHeight } : {}
    const inputPaddingLeftStyle = this.props.dialCodeWidth ? { paddingLeft: this.props.dialCodeWidth + 4 } : {}
    const btnHeightStyle = this.props.inputHeight ? { height: this.props.inputHeight - 2 } : {}
    const dialCodeStyle = this.props.dialCodeWidth ? { width: this.props.dialCodeWidth } : {}

    return (
      <div
        className={classNames(
          'react-tel-input',
          this.props.classNames,
          this.props.className,
          this.props.disabled && 'react-tel-input-disabled'
        )}
        data-test-id="src_reacttelephoneinput_test_id_4"
        style={this.props.reactTelInputStyle}
      >
        <div
          className={flagViewClasses}
          onKeyDown={this.handleKeydown}
          data-test-id="src_reacttelephoneinput_test_id_6"
        >
          <button
            onClick={this.handleFlagDropdownClick}
            className="selected-flag"
            // title={`${selectedCountry.name}: + ${selectedCountry.dialCode}`}
            data-test-id="src_reacttelephoneinput_test_id_7"
            onKeyDown={this.handleFlagKeyDown}
            type={'button' as any}
            {...buttonProps}
            style={{ ...btnHeightStyle, ...dialCodeStyle }}
          >
            {/* <div
              className={inputFlagClasses}
              // style={this.getFlagStyle()}
              data-test-id="src_reacttelephoneinput_test_id_8"
            >
              <div
                className={arrowClasses}
                data-test-id="src_reacttelephoneinput_test_id_9"
              />
            </div> */}

            {/* <span>{`+${this.state.selectedCountry?.dialCod}`}</span> 無法更新視圖，對象是引用類型*/}
            <div className={'dialCode'}>{`+${this.state.dialCode}`}</div>
          </button>
          {this.state.showDropDown ? this.getCountryDropDownList() : ''}
        </div>
        <input
          onChange={this.handleInput}
          onClick={this.handleInputClick}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onKeyDown={this.handleInputKeyDown}
          value={this.state.formattedNumber}
          ref={(node) => {
            this.numberInputRef = node;
          }}
          type="tel"
          className={inputClasses}
          autoComplete={this.props.autoComplete}
          pattern={this.props.pattern}
          required={this.props.required}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          {...otherProps}
          data-test-id="src_reacttelephoneinput_test_id_5"
          id="ReactTelephoneInputId"
          style={{ ...this.props.inputFormControlStyle, ...inputHeightStyle, ...inputPaddingLeftStyle }}
        />
      </div>
    );
  }
}

export default enhanceWithClickOutside(ReactTelephoneInput);
