import Link from 'next/link'
import Head from 'next/head'

function ServicePage(props) {
	const title = 'Service';

	return <>
		<Head>
			<title>{title}</title>
			<meta property="og:title" content={title} key="title" />
		</Head>
		<section className={''}>
			<p>TODO ServicePage</p>
		</section>
	</>
}

export default ServicePage;
