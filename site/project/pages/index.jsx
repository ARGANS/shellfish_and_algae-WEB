import Link from 'next/link'
import Head from 'next/head'

function IndexPage(props) {
	const title = 'SMOS';

	return <>
		<Head>
			<title>{title}</title>
			<meta property="og:title" content={title} key="title" />
		</Head>
		<section className={''}>
			<p>TODO</p>
		</section>
	</>
}

export default IndexPage;
