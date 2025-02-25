import { AppSeparator } from 'app/shared/components/separator/AppSeparator';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';
import { MainSidebar } from './app-sidebar';
import { AppBreadcrumb } from 'app/shared/components/breadcrumb/AppBreadcrumb';

export default function Page() {
  return (
    <AppSidebar.Provider>
      <MainSidebar />
      <AppSidebar.Inset>
        <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
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
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
            <div className='bg-muted/50 aspect-video rounded-xl' />
            <div className='bg-muted/50 aspect-video rounded-xl' />
            <div className='bg-muted/50 aspect-video rounded-xl' />
          </div>
          <div className='bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min' />
        </div>
      </AppSidebar.Inset>
    </AppSidebar.Provider>
  );
}
