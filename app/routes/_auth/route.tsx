import { Outlet } from '@remix-run/react';
import { AppBreadcrumb } from 'app/shared/components/breadcrumb/AppBreadcrumb';
import { AppSeparator } from 'app/shared/components/separator/AppSeparator';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { themeStore, ThemeStoreAtom } from 'app/shared/stores/themeStore';
import { Provider, useAtomValue } from 'jotai';
import { MainSidebar } from './MainSidebar';

export default function Page() {
  return (
    <Provider store={themeStore}>
      <AppSidebar.Provider className='max-h-screen max-w-screen'>
        <MainSidebar />
        <AppSidebar.Inset>
          <Header />
          <PageOutlet />
        </AppSidebar.Inset>
      </AppSidebar.Provider>
    </Provider>
  );
}

function PageOutlet() {
  const headerHeight = useAtomValue(ThemeStoreAtom.headerHeight);

  return (
    <div
      className='flex flex-1 flex-col gap-4 p-4 pt-0'
      style={{
        paddingTop: `${headerHeight}px`,
        maxHeight: `calc(100vh - ${headerHeight}px)`,
      }}>
      <Outlet />
    </div>
  );
}

function Header() {
  const [headerRef] = useElementSpace((space) => {
    if (!space) return;
    themeStore.set(ThemeStoreAtom.headerHeight, space?.height ?? 0);
  });

  return (
    <header
      ref={headerRef}
      className='fixed flex h-16 shrink-0 items-center gap-2 bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <AppSidebar.Trigger className='-ml-1' />
        <AppSeparator
          orientation='vertical'
          className='mr-2 data-[orientation=vertical]:h-4'
        />
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
