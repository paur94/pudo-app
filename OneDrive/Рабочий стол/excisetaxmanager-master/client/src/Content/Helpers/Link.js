import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';

export default function Link({ children, url = '', external, ...rest }) {
    // Use an regular a tag for external and download links
    if (isOutboundLink(url) || rest.download) {
        return (
            <a href={url} target={external ? '_blank' : '_self'} {...rest}>
                {children}
            </a>
        );
    }

    return (
        <ReactRouterLink to={url} {...rest}>
            {children}
        </ReactRouterLink>
    );
}

function isOutboundLink(url) {
    return /^(?:[a-z][a-z\d+.-]*:|\/\/)/.test(url);
}