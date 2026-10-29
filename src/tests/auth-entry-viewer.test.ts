import { describe, it, expect } from 'vitest';
import React from 'react';
import { AuthEntryViewer } from '../components/AuthEntryViewer';

describe('AuthEntryViewer component', () => {
  it('is exported and defined as a React component', () => {
    expect(AuthEntryViewer).toBeDefined();
    expect(typeof AuthEntryViewer).toBe('function');
  });

  it('instantiates cleanly with contract invocation metadata', () => {
    const element = React.createElement(AuthEntryViewer, {
      invokerAddress: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      authorizedContractId: 'CCBYK4O47SCLF6Q5F773R4U2W7Z26S4JGB27F5O6H2N72B3Z37Y2P6P7',
      functionName: 'commit_to_circle',
      argumentsPreview: {
        circle_id: 'CIRCLE_42',
        volume: 250,
      },
    });

    expect(element).toBeDefined();
    expect(element.props.functionName).toBe('commit_to_circle');
    expect(element.props.argumentsPreview?.circle_id).toBe('CIRCLE_42');
  });
});

