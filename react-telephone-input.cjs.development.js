'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var R = _interopDefault(require('cramda'));
var VirtualList = _interopDefault(require('react-tiny-virtual-list'));
var debounce = _interopDefault(require('debounce'));
var memoize = _interopDefault(require('lodash.memoize'));
var React = require('react');
var classNames = _interopDefault(require('classnames'));
var enhanceWithClickOutside = _interopDefault(require('react-click-outside'));
var countryData = _interopDefault(require('country-telephone-data'));

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var first = R.first,
    tail = R.tail;

function formatNumber(text, pattern, autoFormat) {
  if (autoFormat === void 0) {
    autoFormat = false;
  }

  if (!text || text.length === 0) {
    return '+';
  } // for all strings with length less than 3, just return it (1, 2 etc.)
  // also return the same text if the selected country has no fixed format


  if (text && text.length < 2 || !pattern || !autoFormat) {
    return "+" + text;
  }

  var formattedObject = pattern.split('').reduce(function (acc, character) {
    if (acc.remainingText.length === 0) {
      return acc;
    }

    if (character !== '.') {
      return {
        formattedText: acc.formattedText + character,
        remainingText: acc.remainingText
      };
    }

    return {
      formattedText: acc.formattedText + first(acc.remainingText),
      remainingText: tail(acc.remainingText)
    };
  }, {
    formattedText: '',
    remainingText: text.split('')
  }); // return formattedObject.formattedText + formattedObject.remainingText.join('');

  return formattedObject.remainingText.join('');
}
// const { first, tail } = R;
// function formatNumber(
//   text: string,
//   pattern: string | null,
//   autoFormat = false,
// ) {
//   if (!text || text.length === 0) {
//     return '+';
//   }
//   // for all strings with length less than 3, just return it (1, 2 etc.)
//   // also return the same text if the selected country has no fixed format
//   if ((text && text.length < 2) || !pattern || !autoFormat) {
//     return `+${text}`;
//   }
//   const formattedObject = pattern.split('').reduce(
//     (acc, character) => {
//       if (acc.remainingText.length === 0) {
//         return acc;
//       }
//       if (character !== '.') {
//         return {
//           formattedText: acc.formattedText + character,
//           remainingText: acc.remainingText,
//         };
//       }
//       return {
//         formattedText: acc.formattedText + first(acc.remainingText),
//         remainingText: tail(acc.remainingText),
//       };
//     },
//     { formattedText: '', remainingText: text.split('') },
//   );
//   return formattedObject.formattedText + formattedObject.remainingText.join('');
// }
// export default formatNumber;

function replaceCountryCode(currentSelectedCountry, nextSelectedCountry, number) {
  var dialCodeRegex = RegExp("^(" + currentSelectedCountry.dialCode + ")");
  var codeToBeReplaced = number.match(dialCodeRegex);
  var newNumber = number.replace(dialCodeRegex, nextSelectedCountry.dialCode);

  if (codeToBeReplaced === null && newNumber === number) {
    return nextSelectedCountry.dialCode + number;
  }

  return newNumber;
}

function isNumberValid(inputNumber) {
  var countries = countryData.allCountries;
  return R.any(function (country) {
    return R.startsWith(country.dialCode, inputNumber) || R.startsWith(inputNumber, country.dialCode);
  }, countries);
}

// memoize results based on the first 5/6 characters. That is all that matters
var find = R.find,
    propEq = R.propEq,
    startsWith = R.startsWith;
var allCountries = countryData.allCountries,
    allCountryCodes = countryData.allCountryCodes;
function guessSelectedCountry(inputNumber, props) {
  var defaultCountry = props.defaultCountry;
  var onlyCountries = props.onlyCountries;
  var secondBestGuess = find(propEq('iso2', defaultCountry), allCountries) || onlyCountries[0];
  var inputNumberForCountries = inputNumber.substr(0, 4);
  var bestGuess;

  if (inputNumber.trim() !== '') {
    bestGuess = onlyCountries.reduce(function (selectedCountry, country) {
      // if the country dialCode exists WITH area code
      if (allCountryCodes[inputNumberForCountries] && allCountryCodes[inputNumberForCountries][0] === country.iso2) {
        return country; // if the selected country dialCode is there with the area code
      } else if (allCountryCodes[inputNumberForCountries] && allCountryCodes[inputNumberForCountries][0] === selectedCountry.iso2) {
        return selectedCountry; // else do the original if statement
      }

      if (startsWith(country.dialCode, inputNumber)) {
        if (country.dialCode.length > selectedCountry.dialCode.length) {
          return country;
        }

        if (country.dialCode.length === selectedCountry.dialCode.length && country.priority < selectedCountry.priority) {
          return country;
        }
      }

      return selectedCountry;
    }, {
      dialCode: '',
      priority: 10001
    });
  } else {
    return secondBestGuess;
  }

  if (!bestGuess || !bestGuess.name) {
    return secondBestGuess;
  }

  return bestGuess;
}

var find$1 = R.find,
    propEq$1 = R.propEq,
    equals = R.equals,
    findIndex = R.findIndex,
    startsWith$1 = R.startsWith;
var allCountries$1 = countryData.allCountries,
    iso2Lookup = countryData.iso2Lookup;
var isModernBrowser = true;

if (typeof document !== 'undefined') {
  isModernBrowser = /*#__PURE__*/Boolean( /*#__PURE__*/document.createElement('input').setSelectionRange);
} else {
  isModernBrowser = true;
}

var keys = {
  UP: 38,
  DOWN: 40,
  RIGHT: 39,
  LEFT: 37,
  ENTER: 13,
  ESC: 27,
  PLUS: 43,
  A: 65,
  Z: 90,
  SPACE: 32
};

function getDropdownListWidth() {
  var defaultWidth = 400;
  var horizontalMargin = 20;

  if (window.innerWidth - horizontalMargin < defaultWidth) {
    return window.innerWidth - horizontalMargin;
  } else {
    return defaultWidth;
  }
}

var ReactTelephoneInput = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ReactTelephoneInput, _Component);

  function ReactTelephoneInput(props) {
    var _this;

    _this = _Component.call(this, props) || this;
    _this.numberInputRef = null; // put the cursor to the end of the input (usually after a focus event)

    _this._cursorToEnd = function (skipFocus) {
      if (skipFocus === void 0) {
        skipFocus = false;
      }

      var input = _this.numberInputRef;

      if (skipFocus) {
        _this._fillDialCode();
      } else {
        if (input) {
          input.focus();
        }

        if (isModernBrowser && input) {
          var len = input.value.length;
          input.setSelectionRange(len, len);
        }
      }
    };

    _this.handleFlagDropdownClick = function (e) {
      if (_this.props.disabled) {
        return;
      }

      e.preventDefault();
      var preferredCountries = _this.state.preferredCountries;
      var selectedCountry = _this.state.selectedCountry;
      var onlyCountries = _this.props.onlyCountries;
      var highlightCountryIndex = findIndex(propEq$1('iso2', selectedCountry.iso2), preferredCountries.concat(onlyCountries)); // need to put the highlight on the current selected country if the dropdown is going to open up

      _this.setState({
        showDropDown: !_this.state.showDropDown,
        highlightCountryIndex: highlightCountryIndex
      });
    };

    _this.handleInput = function (event) {
      var formattedNumber = '+';
      var newSelectedCountry = _this.state.selectedCountry;
      var freezeSelection = _this.state.freezeSelection; // if the input is the same as before, must be some special key like enter, alt, command etc.

      if (event.target.value === _this.state.formattedNumber) {
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
        var inputNumber = event.target.value.replace(/\D/g, ''); // we don't need to send the whole number to guess the country...
        // only the first 6 characters are enough
        // the guess country function can then use memoization much more effectively
        // since the set of input it gets has drastically reduced

        if (!_this.state.freezeSelection || newSelectedCountry.dialCode.length > inputNumber.length) {
          newSelectedCountry = guessSelectedCountry(inputNumber.substring(0, 6), _this.props);
          freezeSelection = false;
        }

        formattedNumber = formatNumber(inputNumber, newSelectedCountry && newSelectedCountry.format ? newSelectedCountry.format : null, _this.props.autoFormat);
      }

      var caretPosition = event.target.selectionStart || 0;
      var oldFormattedText = _this.state.formattedNumber;
      var diff = formattedNumber.length - oldFormattedText.length;
      var selectedCountry = newSelectedCountry.dialCode.length > 0 ? newSelectedCountry : _this.state.selectedCountry;

      _this.setState({
        formattedNumber: formattedNumber,
        freezeSelection: freezeSelection,
        selectedCountry: selectedCountry
      }, function () {
        if (isModernBrowser) {
          if (caretPosition === 1 && formattedNumber.length === 2) {
            caretPosition += 1;
          }

          if (diff > 0) {
            caretPosition -= diff;
          }

          if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
            if (_this.numberInputRef) {
              _this.numberInputRef.setSelectionRange(caretPosition, caretPosition);
            }
          }
        }

        if (_this.props.onChange) {
          _this.props.onChange(formattedNumber, selectedCountry);
        }
      });
    };

    _this.handleInputClick = function () {
      _this.setState({
        showDropDown: false
      });
    };

    _this.handleFlagItemClick = function (country) {
      var onlyCountries = _this.props.onlyCountries;
      var currentSelectedCountry = _this.state.selectedCountry;
      var nextSelectedCountry = find$1(function (c) {
        return c.iso2 === country.iso2;
      }, onlyCountries); // tiny optimization

      if (nextSelectedCountry && currentSelectedCountry.iso2 !== nextSelectedCountry.iso2) {
        var newNumber = replaceCountryCode(currentSelectedCountry, nextSelectedCountry, _this.state.formattedNumber.replace(/\D/g, ''));
        var formattedNumber = formatNumber(newNumber, nextSelectedCountry.format, _this.props.autoFormat);

        _this.setState({
          showDropDown: false,
          selectedCountry: nextSelectedCountry,
          freezeSelection: true,
          formattedNumber: formattedNumber
        }, function () {
          _this._cursorToEnd();

          if (_this.props.onChange) {
            _this.props.onChange(formattedNumber, nextSelectedCountry);
          }
        });
      } else {
        _this.setState({
          showDropDown: false
        });
      }
    };

    _this.handleInputFocus = function () {
      // trigger parent component's onFocus handler
      if (typeof _this.props.onFocus === 'function') {
        _this.props.onFocus(_this.state.formattedNumber, _this.state.selectedCountry);
      }

      _this._fillDialCode();
    };

    _this._fillDialCode = function () {
      var selectedCountry = _this.state.selectedCountry; // if the input is blank, insert dial code of the selected country

      if (_this.numberInputRef && _this.numberInputRef.value === '+') {
        _this.setState({
          formattedNumber: "+" + selectedCountry.dialCode
        });
      }
    };

    _this._getHighlightCountryIndex = function (direction) {
      var onlyCountries = _this.props.onlyCountries;
      var _this$state = _this.state,
          highlightCountryIndex = _this$state.highlightCountryIndex,
          preferredCountries = _this$state.preferredCountries; // had to write own function because underscore does not have findIndex. lodash has it

      var newHighlightCountryIndex = highlightCountryIndex + direction;

      if (newHighlightCountryIndex < 0 || newHighlightCountryIndex >= onlyCountries.length + preferredCountries.length) {
        return newHighlightCountryIndex - direction;
      }

      return newHighlightCountryIndex;
    }; // memoize search results... caching all the way


    _this._searchCountry = memoize(function (queryString) {
      var onlyCountries = _this.props.onlyCountries;

      if (!queryString || queryString.length === 0) {
        return null;
      } // don't include the preferred countries in search


      var probableCountries = onlyCountries.filter(function (country) {
        return country.name ? startsWith$1(queryString.toLowerCase(), country.name.toLowerCase()) : false;
      }, _assertThisInitialized(_this));
      return probableCountries[0];
    });

    _this.searchCountry = function () {
      var onlyCountries = _this.props.onlyCountries;
      var probableCandidate = _this._searchCountry(_this.state.queryString) || onlyCountries[0];

      var probableCandidateIndex = findIndex(propEq$1('iso2', probableCandidate.iso2), _this.props.onlyCountries) + _this.state.preferredCountries.length;

      _this.setState({
        queryString: '',
        highlightCountryIndex: probableCandidateIndex
      });
    };

    _this.handleKeydown = function (event) {
      var onlyCountries = _this.props.onlyCountries;

      if (!_this.state.showDropDown || event.metaKey || event.altKey) {
        return;
      } // ie hack


      if (event.preventDefault) {
        event.preventDefault();
        event.nativeEvent.preventDefault();
      }

      var _moveHighlight = function _moveHighlight(direction) {
        var highlightCountryIndex = _this._getHighlightCountryIndex(direction);

        _this.setState({
          highlightCountryIndex: highlightCountryIndex
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
          _this.handleFlagItemClick(_this.state.preferredCountries.concat(onlyCountries)[_this.state.highlightCountryIndex]);

          break;

        case keys.ESC:
          _this.setState({
            showDropDown: false
          }, _this._cursorToEnd);

          break;

        default:
          if (event.which >= keys.A && event.which <= keys.Z || event.which === keys.SPACE) {
            _this.setState({
              queryString: _this.state.queryString + String.fromCharCode(event.which)
            }, _this.state.debouncedQueryStingSearcher);
          }

      }
    };

    _this.handleInputKeyDown = function (event) {
      if (event.which === keys.ENTER && typeof _this.props.onEnterKeyPress === 'function') {
        _this.props.onEnterKeyPress(event);
      }
    };

    _this.handleClickOutside = function () {
      if (_this.state.showDropDown) {
        _this.setState({
          showDropDown: false
        });
      }
    };

    _this.getCountryDropDownList = function () {
      var onlyCountries = _this.props.onlyCountries;
      var _this$state2 = _this.state,
          highlightCountryIndex = _this$state2.highlightCountryIndex,
          preferredCountries = _this$state2.preferredCountries;
      var data = preferredCountries.concat(onlyCountries);
      return React.createElement(VirtualList, {
        width: getDropdownListWidth(),
        height: 300,
        itemCount: data.length,
        itemSize: 40,
        style: _this.props.listStyle,
        className: "country-list",
        scrollToIndex: highlightCountryIndex,
        scrollToAlignment: 'center',
        renderItem: function renderItem(_ref) {
          var index = _ref.index,
              style = _ref.style;
          var country = data[index];
          var itemClasses = classNames(_this.props.listItemClassName, {
            preferred: findIndex(propEq$1('iso2', country.iso2), _this.state.preferredCountries) >= 0,
            highlight: _this.state.highlightCountryIndex === index
          });
          var inputFlagClasses = "flag " + country.iso2;
          return React.createElement("div", {
            key: "flag_no_" + index,
            "data-flag-key": "flag_no_" + index,
            className: itemClasses,
            "data-dial-code": country.dialCode,
            "data-country-code": country.iso2,
            onClick: _this.handleFlagItemClick.bind(_assertThisInitialized(_this), country),
            style: style,
            title: country.name + " - " + country.dialCode,
            "data-test-id": "src_reacttelephoneinput_test_id_0"
          }, React.createElement("div", {
            className: inputFlagClasses,
            style: _this.getFlagStyle(),
            "data-test-id": "src_reacttelephoneinput_test_id_1"
          }), React.createElement("span", {
            className: "country-name",
            "data-test-id": "src_reacttelephoneinput_test_id_2"
          }, country.name), React.createElement("span", {
            className: "dial-code",
            "data-test-id": "src_reacttelephoneinput_test_id_3"
          }, "+" + country.dialCode));
        }
      });
    };

    _this.getFlagStyle = function () {
      if (_this.props.flagsImagePath) {
        return {
          backgroundImage: "url(" + _this.props.flagsImagePath + ")"
        };
      }

      return {};
    };

    _this.handleInputBlur = function () {
      var selectedCountry = _this.state.selectedCountry;

      if (typeof _this.props.onBlur === 'function') {
        _this.props.onBlur(_this.state.formattedNumber, selectedCountry);
      }
    };

    _this.handleFlagKeyDown = function (event) {
      // only trigger dropdown click if the dropdown is not already open.
      // it will otherwise interfere with key up/down of list
      if (event.which === keys.DOWN && _this.state.showDropDown === false) {
        _this.handleFlagDropdownClick(event);
      }
    }; // eslint-disable-next-line


    var preferredCountriesFromProps = props.preferredCountries;
    var preferredCountries = preferredCountriesFromProps.map(function (iso2) {
      return Object.prototype.hasOwnProperty.call(iso2Lookup, iso2) ? allCountries$1[iso2Lookup[iso2]] : null;
    }).filter(function (val) {
      return val !== null;
    });
    _this.state = {
      firstCall: true,
      preferredCountries: preferredCountries,
      showDropDown: false,
      queryString: '',
      freezeSelection: false,
      debouncedQueryStingSearcher: debounce(_this.searchCountry, 600),
      formattedNumber: '',
      highlightCountryIndex: 0
    };
    return _this;
  }

  var _proto = ReactTelephoneInput.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this._cursorToEnd(true);
  };

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
    return !equals(nextProps, this.props) || !equals(nextState, this.state);
  };

  ReactTelephoneInput.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    var inputNumber;
    var onlyCountries = props.onlyCountries;
    var showDropDown = state.showDropDown,
        preferredCountries = state.preferredCountries,
        selectedCountry = state.selectedCountry; // don't calculate new state if the dropdown is open. We might be changing
    // the highlightCountryIndex using our keys

    if (showDropDown) {
      return state;
    }

    if (props.value) {
      inputNumber = props.value;
    } else if (props.initialValue && state.firstCall) {
      inputNumber = props.initialValue;
    } else if (props.value === null) {
      // just clear the value
      inputNumber = '';
    } else if (state && state.formattedNumber && state.formattedNumber.length > 0) {
      inputNumber = state.formattedNumber;
    } else {
      inputNumber = '';
    }

    var selectedCountryGuess = guessSelectedCountry(inputNumber.replace(/\D/g, ''), props); // if the guessed country has the same dialCode as the selected country in
    // our state, we give preference to the already selected country

    if (selectedCountry && selectedCountryGuess.dialCode === selectedCountry.dialCode) {
      selectedCountryGuess = selectedCountry;
    }

    var selectedCountryGuessIndex = findIndex(propEq$1('iso2', selectedCountryGuess.iso2), preferredCountries.concat(onlyCountries));
    var formattedNumber = formatNumber(inputNumber.replace(/\D/g, ''), selectedCountryGuess && selectedCountryGuess.format ? selectedCountryGuess.format : null, props.autoFormat);
    return {
      firstCall: false,
      selectedCountry: selectedCountryGuess,
      highlightCountryIndex: selectedCountryGuessIndex,
      formattedNumber: formattedNumber
    };
  };

  _proto.render = function render() {
    var _this2 = this;

    var isValid = this.props.isValid;
    var selectedCountry = this.state.selectedCountry;
    var arrowClasses = classNames({
      arrow: true,
      up: this.state.showDropDown
    });
    var inputClasses = classNames({
      'form-control': true,
      'invalid-number': !isValid(this.state.formattedNumber.replace(/\D/g, ''))
    });
    var flagViewClasses = classNames({
      'flag-dropdown': true,
      'open-dropdown': this.state.showDropDown
    });
    var inputFlagClasses = "flag " + selectedCountry.iso2;
    var buttonProps = this.props.buttonProps;
    var otherProps = this.props.inputProps;

    if (otherProps && this.props.inputId) {
      otherProps.id = this.props.inputId;
    }

    return React.createElement("div", {
      className: classNames('react-tel-input', this.props.classNames, this.props.className),
      "data-test-id": "src_reacttelephoneinput_test_id_4"
    }, React.createElement("div", {
      className: flagViewClasses,
      onKeyDown: this.handleKeydown,
      "data-test-id": "src_reacttelephoneinput_test_id_6"
    }, React.createElement("button", Object.assign({
      onClick: this.handleFlagDropdownClick,
      className: "selected-flag",
      title: selectedCountry.name + ": + " + selectedCountry.dialCode,
      "data-test-id": "src_reacttelephoneinput_test_id_7",
      onKeyDown: this.handleFlagKeyDown,
      type: 'button'
    }, buttonProps), React.createElement("div", {
      className: inputFlagClasses,
      style: this.getFlagStyle(),
      "data-test-id": "src_reacttelephoneinput_test_id_8"
    }, React.createElement("div", {
      className: arrowClasses,
      "data-test-id": "src_reacttelephoneinput_test_id_9"
    }))), this.state.showDropDown ? this.getCountryDropDownList() : ''), React.createElement("input", Object.assign({
      onChange: this.handleInput,
      onClick: this.handleInputClick,
      onFocus: this.handleInputFocus,
      onBlur: this.handleInputBlur,
      onKeyDown: this.handleInputKeyDown,
      value: this.state.formattedNumber,
      ref: function ref(node) {
        _this2.numberInputRef = node;
      },
      type: "tel",
      className: inputClasses,
      autoComplete: this.props.autoComplete,
      pattern: this.props.pattern,
      required: this.props.required,
      placeholder: this.props.placeholder,
      disabled: this.props.disabled
    }, otherProps, {
      "data-test-id": "src_reacttelephoneinput_test_id_5"
    })));
  };

  return ReactTelephoneInput;
}(React.Component);
ReactTelephoneInput.defaultProps = {
  autoFormat: true,
  onlyCountries: allCountries$1,
  defaultCountry: allCountries$1[0].iso2,
  isValid: isNumberValid,
  flagsImagePath: 'flags.png',
  onEnterKeyPress: function onEnterKeyPress() {},
  preferredCountries: [],
  disabled: false,
  placeholder: '+1 (702) 123-4567',
  autoComplete: 'tel',
  required: false,
  inputProps: {},
  buttonProps: {},
  listItemClassName: 'country',
  listStyle: {
    zIndex: 20,
    backgroundColor: 'white'
  }
};
var ReactTelephoneInput$1 = /*#__PURE__*/enhanceWithClickOutside(ReactTelephoneInput);

exports.ReactTelephoneInput = ReactTelephoneInput;
exports.default = ReactTelephoneInput$1;
//# sourceMappingURL=react-telephone-input.cjs.development.js.map
