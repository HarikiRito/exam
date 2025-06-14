import { Navigate, Outlet, useLocation } from '@remix-run/react';
import { AppBreadcrumb } from 'app/shared/components/breadcrumb/AppBreadcrumb';
import { AppSeparator } from 'app/shared/components/separator/AppSeparator';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { themeStore } from 'app/shared/stores/theme.store';
import { MainSidebar } from './MainSidebar';
import { useSnapshot } from 'valtio';
import { useIsAuthenticatedQuery } from 'app/graphql/operations/auth/isAuthenticated.generated';
import { APP_ROUTES } from 'app/shared/constants/routes';
export default function Page() {
  const { data } = useIsAuthenticatedQuery();
  const pathname = useLocation();

  if (data && !data.isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} />;
  }

  if (pathname.pathname.startsWith('/test/session/')) {
    return <Outlet />;
  }

  return (
    <AppSidebar.Provider className='max-h-screen max-w-screen overflow-x-hidden'>
      <MainSidebar />
      <AppSidebar.Inset>
        <Header />
        <PageOutlet />
      </AppSidebar.Inset>
    </AppSidebar.Provider>
  );
}

function PageOutlet() {
  const theme = useSnapshot(themeStore);
  const headerHeight = theme.headerHeight;
  const sideBarWidth = theme.sideBarWidth;
  return (
    <div
      className='flex flex-1 flex-col gap-4 p-4 px-0 pt-0'
      style={{
        paddingTop: `${headerHeight}px`,
        height: `calc(100dvh - ${headerHeight}px)`,
        width: `calc(100vw - ${sideBarWidth + 16}px)`,
      }}>
      <Outlet />
    </div>
  );
}

function Header() {
  const [headerRef] = useElementSpace((space) => {
    if (!space) return;
    themeStore.headerHeight = space.height;
  });

  return (
    <header
      ref={headerRef}
      className='fixed z-[10] flex h-16 w-full shrink-0 items-center gap-2 bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <AppSidebar.Trigger className='-ml-1' />
        <AppSeparator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
        <AppBreadcrumb.Root>
          <AppBreadcrumb.List>
            <AppBreadcrumb.Item>
              <AppBreadcrumb.Link href='#' className='hidden md:block'>
                Building Your Application
              </AppBreadcrumb.Link>
            </AppBreadcrumb.Item>
            <AppBreadcrumb.Separator className='hidden md:block' />
            <AppBreadcrumb.Item>
              <AppBreadcrumb.Page>Data Fetching</AppBreadcrumb.Page>
            </AppBreadcrumb.Item>
          </AppBreadcrumb.List>
        </AppBreadcrumb.Root>
      </div>
    </header>
  );
}
