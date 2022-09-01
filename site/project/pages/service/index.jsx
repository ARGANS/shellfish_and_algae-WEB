import Head from 'next/head'
import s from './service_page.module.css'
// import DatePicker from 'libs/DatePicker/DatePicker';
import SimulationList from 'components/SimulationList/SimulationList';
import algae_parameters from 'models/macroalgae_model_parameters.json'
import shellfish_parameters from 'models/shellfish_model_parameters.json'
import JobList from 'components/JobList/JobList';
import "@fontsource/montserrat";
import Sicon from 'libs/Sicon/Sicon';
import Tabs from 'libs/Tabs/Tabs';

export default function ServicePage(props) {
	const title = 'Service';

	return <>
		<Head>
			<title>{title}</title>
			<meta property="og:title" content={title} key="title" />
			<link rel="stylesheet" type="text/css" href="/assets/main.css" />
			<link rel="stylesheet" type="text/css" href="/assets/index.css" />
		</Head>
		<main className={s.root}>
			<div className={s.main}>
				<Tabs>
					<SimulationList id="Algae" parameters={props.algae}/>
					<SimulationList id="Shellfish" parameters={props.shellfish}/>	
				</Tabs>
				{/* <DatePicker date={new Date()} className={s.dp} onChange={date => console.log('Selected %s', date)}/> */}
			</div>
			<div className={s.sidebar}>
				<h3 className={s.sidebar_title}>List of containers</h3>
				<JobList/>
			</div>
			<div className={s.header}>
				<div className="bflex-row">
					<div className="flex-size-fill">&nbsp;</div>
					<div className="flex-size-own">
						<a className="icon-link roffset-d" href="/api/v1/auth/logout?redirect=/">
							<Sicon link={'/assets/images/service_icons.svg#logout'} title="Log out"/>
						</a>
					</div>
				</div>
			</div>
			<div className={s.footer}></div>
		</main>
	</>
}

export async function getStaticProps(context) {
	return {
		props: {
			algae: algae_parameters,
			shellfish: shellfish_parameters,
		},
	}
}
