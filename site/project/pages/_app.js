import { MainLayout } from 'components/MainLayout/MainLayout';
import { ComponentHeap } from 'libs/ComponentHeap/ComponentHeap';

export default function App({ Component, pageProps}) {
	const Layout = !Component.hasOwnProperty('__layout') ? MainLayout : Component.__layout;
	return (<Layout>
		<Component {...pageProps} />
		<ComponentHeap zIndex={1000}/>
	</Layout>);
}
