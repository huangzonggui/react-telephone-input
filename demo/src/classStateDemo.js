import React from 'react';
import { render } from 'react-dom';
// import testGenerator from 'generate-ui-tests'

// import ReactTelephoneInput from '../../src/withStyles'
import RTI from '../../src/withStyles';

import countryData from 'country-telephone-data';
import { CodeBlock } from '.';

const flagsImagePath = require('../../images/flags.png');
// const RTI = testGenerator(ReactTelephoneInput)

export default class classStateDemo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mobileNumber: '',
      dialCode: ''
    }
  }


  handleInputChangeAndBlur(mobileNumber, dialCode) {
    this.setState({
      mobileNumber,
      dialCode
    })
  }

  render() {
    return <div>
      <h3></h3>
      <CodeBlock>
        {`class state demo`}
      </CodeBlock>

      <div>
        <h4>state: </h4>
        <span>dialCode: {this.state.dialCode} </span>

        <span>mobileNumber: {this.state.mobileNumber}</span>
      </div>

      <RTI
        flagsImagePath={flagsImagePath}
        // disabled={true}
        onChange={this.handleInputChangeAndBlur.bind(this)}
        onBlur={this.handleInputChangeAndBlur.bind(this)}
        onlyCountries={[
          { name: "Macau (澳門)", iso2: "mo", dialCode: "853", priority: 0, format: "+..-..-....-...." },
          { name: "United States", iso2: "us", dialCode: "1", priority: 0, format: "+. (...) ...-...." },
          { name: "Canada", iso2: "ca", dialCode: "1", priority: 1, format: "+. (...) ...-....", hasAreaCodes: true },
          { name: "Mexico (México)", iso2: "mx", dialCode: "52", priority: 0, format: "+..-..-..-...." },
          { name: "Brazil (Brasil)", iso2: "br", dialCode: "55", priority: 0, format: "+..-..-....-...." },
        ]}
        initialValue={this.state.mobileNumber}// 初始化电话
        initialDialCode={this.state.dialCode}
        // 看源碼 firstCall， 第一次渲染才會顯示，如果 this.props.mobileNumber 是通過 setState 異步設置值，就無法渲染
        value={this.state.mobileNumber}// 加了：刪除都最後一個無法刪除 不加：修改預約時，沒有初始值
        reactTelInputStyle={{
          width: '100%',
          fontSize: 20
        }}
        inputHeight={50}
        dialCodeWidth={90}
      />

    </div>
  }
}
