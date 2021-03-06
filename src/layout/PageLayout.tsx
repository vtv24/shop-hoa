import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { signIn, useSession } from 'next-auth/client';
import { Spinner } from '@chakra-ui/react';
import Footer from '~src/components/Footer';
import Header from '~src/components/Header';
import { useRouter } from 'next/dist/client/router';
import { useEffect } from 'react';
import { createContext } from 'react';
import { useState } from 'react';
import routers from '~src/routerConfig';
import { removeUserId, setUserId } from '~src/services/instance';
import Head from 'next/head';
import CartProvider from '~src/providers/cartProvider';

type IPageLayoutContext = {
    setLoading: Dispatch<SetStateAction<boolean>>;
    setCurrentRouter: Dispatch<SetStateAction<IRouter>>;
    loading: boolean;
    currentRouter: IRouter;
    search: {
        value: string;
    };
    setSearch: (value: string) => void;
};

// @ts-ignore
const pageLayoutContext = createContext<IPageLayoutContext>({});

export const useLayoutContext = () => useContext(pageLayoutContext);

const PageLayout: FC = ({ children }) => {
    const [session, loading] = useSession();
    const router = useRouter();

    const [currentRouter, setCurrentRouter] = useState<IRouter>(routers[0]);
    const [loadingTop, setLoadingTop] = useState(false);
    const [search, setSearch] = useState({
        value: '',
    });

    useEffect(() => {
        setCurrentRouter(routers.find((r) => r.path == router.pathname) || routers[0]);
        window.scrollTo(0, 0);
    }, [router.pathname]);

    useEffect(() => {
        if (currentRouter.path != '/hoa') {
            setSearch({
                value: '',
            });
        }
    }, [currentRouter]);

    useEffect(() => {
        if (search.value != '') {
            router.push({
                pathname: '/hoa',
                query: {
                    search: search.value,
                },
            });
        }
    }, [search]);

    if (loading)
        return (
            <div className="w-screen h-screen flex flex-col gap-4 justify-center items-center">
                <Spinner colorScheme="orange" size="xl" />
                <p className="text-sm">Loading . . .</p>
            </div>
        );

    if (session?.user?._id) {
        setUserId(session?.user?._id);
    } else {
        removeUserId();
    }

    if (
        currentRouter.role &&
        (!session?.user?._id || (session.expires && new Date(session.expires) <= new Date(Date.now())))
    ) {
        signIn();
        return (
            <div className="w-screen h-screen flex flex-col gap-4 justify-center items-center">
                <Spinner colorScheme="orange" size="xl" />
                <p className="text-sm">Redirecting . . .</p>
            </div>
        );
    }

    return (
        <pageLayoutContext.Provider
            value={{
                setLoading: setLoadingTop,
                loading: loadingTop,
                currentRouter,
                setCurrentRouter,
                search,
                setSearch: (value: string) => {
                    setSearch({
                        value: value,
                    });
                },
            }}
        >
            <Head>
                <title>{currentRouter.name}</title>
            </Head>
            <CartProvider>
                <Header />
                <section className="my-20 max-w-7xl mx-auto">{children}</section>
                <Footer />
            </CartProvider>
        </pageLayoutContext.Provider>
    );
};

export default PageLayout;
