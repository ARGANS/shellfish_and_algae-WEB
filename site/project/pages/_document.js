import Document, { Head, Main, NextScript, Html } from 'next/document'

export default class SiteDocument extends Document {
	static getInitialProps({ renderPage }) {
		const { html, head, errorHtml, chunks } = renderPage()
		return { html, head, errorHtml, chunks};
	}

	render() {
	return (
		<Html lang="en">
			<Head>
				<meta charSet="utf-8" />
				<link rel="stylesheet" href="/assets/styles/global.css"/>
				<link rel="preconnect" href="https://fonts.gstatic.com"/>
				<link href={'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap'} rel="stylesheet"/>
				<meta name="theme-color" content="#323A40"></meta> 
				<link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/favicons/touch-icon-iphone-retina_180.png" />
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="prefetch" href="/assets/art/smos_banner.jpg"></link>
				<link rel="dns-prefetch" href="//fonts.googleapis.com"></link>
				<link href="https://fonts.googleapis.com" crossorigin="" rel="preconnect"></link>
				<meta name="robots" content="index, follow"></meta>
				<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"></meta>
				<meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"></meta>
				<meta name="viewport" content="width=device-width, initial-scale=1"></meta>
			</Head>
			<body>
				{this.props.customValue}
				<Main />
				<NextScript />
			</body>
		</Html>
		)
	}
}
