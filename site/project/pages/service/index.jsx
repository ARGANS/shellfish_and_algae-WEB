import Link from 'next/link'
import Head from 'next/head'
import s from './service_page.module.css'
import ModelProperties from 'components/ModelProperties/ModelProperties';
import model_parameters from 'settings/macroalgae_model_parameters.json'

export default function ServicePage(props) {
	const title = 'Service';
	console.log('[Service_props]');
	console.dir(props);

	return <>
		<Head>
			<title>{title}</title>
			<meta property="og:title" content={title} key="title" />
		</Head>
		<main className={s.root}>
			<div className={s.main}>
				<p>TODO</p>
			</div>
			<div className={s.sidebar}>
				<h3 className={s.sidebar_title}>Model selection</h3>
				<div className={s.modelform}>
					<ModelProperties parameters={props.model_parameters} />	
				</div>
			</div>
			<div className={s.header}>
				<p>1</p>
			</div>
			<div className={s.footer}>
				<p>2</p>	
			</div>
		</main>
	</>
}

export async function getStaticProps(context) {
	return {
	  props: {model_parameters,},
	}
 }
  
