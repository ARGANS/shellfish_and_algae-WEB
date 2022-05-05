import Link from 'next/link'
import Head from 'next/head'
import s from './service_page.module.css'
import DatePicker from 'libs/DatePicker/DatePicker';
import SimulationList from 'components/SimulationList/SimulationList';
import model_parameters from 'models/macroalgae_model_parameters.json'
import JobList from 'components/JobList/JobList';

export default function ServicePage(props) {
	const title = 'Service';
	console.log('[Service_props]');
	console.dir(props);

	return <>
		<Head>
			<title>{title}</title>
			<meta property="og:title" content={title} key="title" />
			<link rel="stylesheet" type="text/css" href="/assets/main.css" />
			<link rel="stylesheet" type="text/css" href="/assets/index.css" />
			<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Montserrat:200,300,regular,600,700,300italic,italic,600italic,700italic,|Kalam:300,regular,700&amp;subset=latin" media="all"></link>
		</Head>
		<main className={s.root}>
			<div className={s.main}>
				<SimulationList parameters={props.model_parameters}/>
				{/* <DatePicker date={new Date()} className={s.dp} onChange={date => console.log('Selected %s', date)}/> */}
			</div>
			<div className={s.sidebar}>
				<h3 className={s.sidebar_title}>List of containers</h3>
			{/* 	<div className={s.modelform}></div> */}
				{/* TODO */}
				<JobList/>
			</div>
			<div className={s.header}>
				<a href="/api/v1/auth/logout?redirect=/">Log out</a>
			</div>
			{/* TODO */}
			{/* <div className={s.footer}></div> */}
		</main>
	</>
}

export async function getStaticProps(context) {
	return {
	  props: {model_parameters,},
	}
}

