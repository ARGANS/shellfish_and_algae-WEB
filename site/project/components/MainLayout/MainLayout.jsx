// import PageFooter from 'components/PageFooter/PageFooter';
// import PageHeader from 'components/PageHeader/PageHeader';

export function MainLayout(props) {
	return <>
		{/* <PageHeader/> */}
		<main>{props.children}</main>
		{/* <PageFooter/> */}
	</>
}
