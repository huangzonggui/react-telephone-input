/// <reference types="lodash" />
import * as React from 'react';
import { Component } from 'react';
import isNumberValid from './number_validator';
declare type Direction = 1 | -1;
declare type ISO2Name = string;
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
    autoComplete: string;
    required: boolean;
    inputProps: React.HTMLProps<HTMLInputElement>;
    buttonProps: React.HTMLProps<HTMLButtonElement>;
    listItemClassName: string;
    listStyle: React.CSSProperties;
}
export declare type Props = {
    value?: string;
    initialValue?: string;
    classNames: string;
    className: string;
    inputId: string;
    onChange: (inputNumber: string, selectedCountry: Country) => void;
    onFocus?: (inputNumber: string, selectedCountry: Country) => void;
    onBlur?: (inputNumber: string, selectedCountry: Country) => void;
    pattern: string;
} & DefaultProps;
interface State {
    firstCall: boolean;
    preferredCountries: Array<Country>;
    showDropDown: boolean;
    queryString: string;
    freezeSelection: boolean;
    debouncedQueryStingSearcher: () => void;
    selectedCountry?: Country;
    highlightCountryIndex: number;
    formattedNumber: string;
}
export declare class ReactTelephoneInput extends Component<Props, State> {
    static defaultProps: {
        autoFormat: boolean;
        onlyCountries: any;
        defaultCountry: any;
        isValid: typeof isNumberValid;
        flagsImagePath: string;
        onEnterKeyPress(): void;
        preferredCountries: never[];
        disabled: boolean;
        placeholder: string;
        autoComplete: string;
        required: boolean;
        inputProps: {};
        buttonProps: {};
        listItemClassName: string;
        listStyle: {
            zIndex: number;
            backgroundColor: string;
        };
    };
    numberInputRef: HTMLInputElement | null;
    constructor(props: Props);
    componentDidMount(): void;
    shouldComponentUpdate(nextProps: Props, nextState: State): boolean;
    static getDerivedStateFromProps(props: Props, state: State): State | {
        firstCall: boolean;
        selectedCountry: Country;
        highlightCountryIndex: any;
        formattedNumber: string;
    };
    _cursorToEnd: (skipFocus?: boolean) => void;
    handleFlagDropdownClick: (e: React.SyntheticEvent<Element, Event>) => void;
    handleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleInputClick: () => void;
    handleFlagItemClick: (country: Country) => void;
    handleInputFocus: () => void;
    _fillDialCode: () => void;
    _getHighlightCountryIndex: (direction: Direction) => number;
    _searchCountry: ((queryString: any) => Country | null) & import("lodash").MemoizedFunction;
    searchCountry: () => void;
    handleKeydown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    handleClickOutside: () => void;
    getCountryDropDownList: () => JSX.Element;
    getFlagStyle: () => {
        backgroundImage: string;
    } | {
        backgroundImage?: undefined;
    };
    handleInputBlur: () => void;
    handleFlagKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    render(): JSX.Element;
}
declare const _default: any;
export default _default;
