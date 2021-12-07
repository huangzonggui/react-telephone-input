import React from 'react';
import { render } from 'react-dom';
// import testGenerator from 'generate-ui-tests'

// import ReactTelephoneInput from '../../src/withStyles'
import RTI from '../../src/withStyles';

import countryData from 'country-telephone-data';

const flagsImagePath = require('../../images/flags.png');
// const RTI = testGenerator(ReactTelephoneInput)

// eslint-disable-next-line
function CodeBlock({ children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

const Demo = () => (
  <div>
    <h4>
      Github repo -{' '}
      <a href="https://github.com/huangzonggui/react-telephone-input">
        https://github.com/huangzonggui/react-telephone-input
      </a>
    </h4>
    <h1>React Telephone Input Demo</h1>
    <h3>Base case</h3>

    <CodeBlock>
      {`one`}
    </CodeBlock>
    <RTI
      flagsImagePath={flagsImagePath}
      // disabled={true}
      initialValue={'1999'}
      initialDialCode={'53'}
      onlyCountries={[
        { name: "Macau (澳門)", iso2: "mo", dialCode: "853", priority: 0, format: "+..-..-....-...." },
        { name: "United States", iso2: "us", dialCode: "1", priority: 0, format: "+. (...) ...-...." },
        { name: "Canada", iso2: "ca", dialCode: "1", priority: 1, format: "+. (...) ...-....", hasAreaCodes: true },
        { name: "Mexico (México)", iso2: "mx", dialCode: "52", priority: 0, format: "+..-..-..-...." },
        { name: "Brazil (Brasil)", iso2: "br", dialCode: "55", priority: 0, format: "+..-..-....-...." },
      ]}
      onChange={(telnumber, country) =>
        console.log('telnumber :>> ', telnumber, 'country: ', country)}
      reactTelInputStyle={{ width: '100%' }}
      inputHeight={50}
      dialCodeWidth={80}
      inputFormControlStyle={{ borderRadius: '2px' }}
    />

    <CodeBlock>{'<RTI flagsImagePath={flagsImagePath} />'}</CodeBlock>
    <RTI flagsImagePath={flagsImagePath} onChange={(telnumber, country) => console.log('telnumber :>> ', telnumber, 'country: ', country)} />
    <br />
    <h3>With initial values and auto focus</h3>
    <CodeBlock>
      {`<RTI
  preferredCountries={['af', 'al']}
  defaultCountry="in"
  flagsImagePath={flagsImagePath}
  initialValue="+9112121"
  inputProps={{ autoFocus: true }}
/>`}
    </CodeBlock>
    <RTI
      preferredCountries={['af', 'al']}
      defaultCountry="in"
      flagsImagePath={flagsImagePath}
      initialValue="+9112121"
      inputProps={{ autoFocus: true }}
    />
    <br />
    <CodeBlock>
      {`<RTI
  defaultCountry="us"
  preferredCountries={['us', 'ca', 'zz', 'hk']}
  flagsImagePath={flagsImagePath}
/>`}
    </CodeBlock>
    <RTI
      defaultCountry="us"
      preferredCountries={['us', 'ca', 'zz', 'hk']}
      flagsImagePath={flagsImagePath}
    />
    <br />
    <h3>Different country - Albania</h3>
    <CodeBlock>
      {`<RTI
  flagsImagePath={flagsImagePath}
  preferredCountries={['af', 'al']}
  defaultCountry="in"
  initialValue="+9112121"
/>`}
    </CodeBlock>
    <RTI
      flagsImagePath={flagsImagePath}
      preferredCountries={['af', 'al']}
      defaultCountry="in"
      initialValue="+9112121"
    />
    <br />
    <h3>With preferred countries</h3>
    <CodeBlock>
      {`<RTI
  defaultCountry="us"
  flagsImagePath={flagsImagePath}
  initialValue="+13559112121"
  preferredCountries={['us', 'ca', 'zz', 'hk']}
/>`}
    </CodeBlock>
    <RTI
      defaultCountry="us"
      flagsImagePath={flagsImagePath}
      initialValue="+13559112121"
      preferredCountries={['us', 'ca', 'zz', 'hk']}
    />

    <CodeBlock>
      {`
    <RTI
      defaultCountry="mo"
      flagsImagePath={flagsImagePath}
      onlyCountries={[
        { name: "Macau (澳門)", iso2: "mo", dialCode: "853", priority: 0, format: "+..-..-....-...." },
        { name: "United States", iso2: "us", dialCode: "1", priority: 0, format: "+. (...) ...-...." },
        { name: "Canada", iso2: "ca", dialCode: "1", priority: 1, format: "+. (...) ...-....", hasAreaCodes: true },
        { name: "Mexico (México)", iso2: "mx", dialCode: "52", priority: 0, format: "+..-..-..-...." },
        { name: "Brazil (Brasil)", iso2: "br", dialCode: "55", priority: 0, format: "+..-..-....-...." },
      ]}
    />`}
    </CodeBlock>
    <RTI
      flagsImagePath={flagsImagePath}
      onlyCountries={[
        { name: "Macau (澳門)", iso2: "mo", dialCode: "853", priority: 0, format: "+..-..-....-...." },
        { name: "United States", iso2: "us", dialCode: "1", priority: 0, format: "+. (...) ...-...." },
        { name: "Canada", iso2: "ca", dialCode: "1", priority: 1, format: "+. (...) ...-....", hasAreaCodes: true },
        { name: "Mexico (México)", iso2: "mx", dialCode: "52", priority: 0, format: "+..-..-..-...." },
        { name: "Brazil (Brasil)", iso2: "br", dialCode: "55", priority: 0, format: "+..-..-....-...." },
      ]}
    />

  </div>
);

render(<Demo />, document.querySelector('#demo'));
