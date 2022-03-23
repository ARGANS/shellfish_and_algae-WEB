import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router';

function IndexPage(props) {
	const title = 'Lot 1: shellfish and algae';
	const router = useRouter();

	return <>
		<Head>
			<title>{title}</title>
			<meta property="og:title" content={title} key="title" />
			<link rel="stylesheet" type="text/css" href="/assets/global.css"/>
			<link rel="stylesheet" type="text/css" href="/assets/main.css" />
			<link rel="stylesheet" type="text/css" href="/assets/index.css" />
			<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Montserrat:200,300,regular,600,700,300italic,italic,600italic,700italic,|Kalam:300,regular,700&amp;subset=latin" media="all"></link>
		</Head>
		<main className="introsection">
            <video playsinline autoPlay muted loop preload="none" className="introsection-video">
                <source src="/assets/pexels-kindel-media-8823621.mp4" type="video/mp4"></source>
            </video>
            <div className="introsection-inner">
                <div className="introsection-inner-top">
                    <div className="introsection-banner">
                        <div className="flex-size-own">
                            <div className="bcontainer main-title">
                                <h1 className="main-title__main">Studies to support the European Green Deal</h1>
                                <h2 className="main-title__secondary">Lot 1 Shellfish and algae</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="introsection-inner-bottom">
                    <div classNameName="bcontainer">
                        <nav className="members-list">
                            <a className="" href="https://argans.co.uk/" target="_blank">
                                <img src="/assets/images/argans_white_new.png" style={{width: '60%'}}/>
                            </a>
                            <a className="" href="https://www.bmrs.ie/" target="_blank">
                                <img src="/assets/images/bantry_flat_white_logo.png" style={{width: '85%'}}/>
                            </a>
                            <a className="" href="https://cofrepeche.fr/en/" target="_blank">
                                <img src="/assets/images/cofrepeche.png" style={{width: '85%'}}/>
                            </a>
                        </nav>
                        <div className="scroll-down-block"> 
                            <svg className=""><use xlinkHref="/assets/images/icons.svg#scroll-down"></use></svg>
                            <h5 className="scroll-down-block_text">Scroll down</h5>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <header className="introheader">
            <div className="bcontainer __flex-row __align-center introheader-btns">
                <div className="flex-size-fill"></div>
                <div className="flex-size-own">
                    <button className="btn btn-secondary">Request of login</button>
                    <button className="btn btn-primary" onClick={() => router.push('/service')}>Sign in</button>
                </div>
            </div>
        </header>
        <section className="main-section">
            <div className="bcontainer">
                <ul className="objectives-list">
					<li>
                        <svg className="icon-objectives __icon4"><use xlinkHref="/assets/images/icons.svg#icon-objectives4"></use></svg>
                        <p>It is a study of Operational Research (OR) to potentially increase shellfish and algae farming and seabed restoration for decreasing the level of harming nutrients (recycling nutrients) and reducing greenhouse gas emission, while not affecting fisheries.</p>
                    </li>
                    <li>
                        <svg className="icon-objectives __icon2"><use xlinkHref="/assets/images/icons.svg#icon-objectives2"></use></svg>
                        <p>It is a matter of balance between benefits and drawback, using mathematical modelling and optimization. This type of study is core policy drafting and decision making.</p>
                    </li>
                    <li>
                        <svg className="icon-objectives __icon5"><use xlinkHref="/assets/images/icons.svg#icon-objectives5"></use></svg>
                        <p>This project will provide important insight into how increasing low-trophic level aquaculture and could be planned in the future to contribute to the blue economy under the EU’s Green Deal.</p>
                    </li>
                    <li>
                        <svg className="icon-objectives __icon3"><use xlinkHref="/assets/images/icons.svg#icon-objectives3"></use></svg>
                        <p>In summary, the general objective is to produce digital raster maps of European marine waters that help plan and analysis of marine aspects of the Green Deal; the specific objective is to assess the potential of shellfish and algae to recycle nutrients and to estimate the greenhouse gas emissions generated by their production.</p>
                    </li>
                </ul>
            </div>
        </section>
        <footer className="footer">
            <div className="bcontainer">
                <div className="bflex-row __align-center">
                    <div className="flex-size-own">
                        <img src="/assets/images/europe_flag.svg" className="footer-logo"/>
                    </div>
                    <div className="flex-size-fill">
                        <p>This study is commissioned by the European Commission (EC) to support the European Green Deal CINEA/EMFF/2020/1.3.1.16 lot1</p>
                    </div>
                </div>
            </div>
        </footer>
	</>
}

export default IndexPage;
