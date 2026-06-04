import { pendingInvoiceColumns } from '@/components/warehouse/pendingTableColumn';
import { DataTable } from '@/components/Datatable';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent';
import DashboardHeader from '@/components/warehouse/DashboardHeader';
import { fetchInvoicesToCheck, fetchPendingInvoices } from '@/lib/actions/invoice';
import { RefreshOnFocus } from '@/components/warehouse/pendingRefresh';
import { invoiceColumns } from '@/components/pendingTableColumn';
import { getCurrentUserSafe } from '@/lib/sessionCheck';
import { redirect } from 'next/navigation';
import Filter from '@/components/Filter';
import InvoiceCard from '@/components/warehouse/InvoiceCard';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    Vtyp?: string;
  }>;
};

const Invoices = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 20;

  const search = params?.search

  const status = params?.status
  const Vtyp = params?.Vtyp

  const pendingInvoices = await fetchPendingInvoices({ page, limit, search, Vtyp });
  const InvoicesToCheck = await fetchInvoicesToCheck(page, limit, search);

  const user = await getCurrentUserSafe();
  if (!user || user.type !== "warehouse" || user.iss !== "pharmacube") {
    redirect("/");
  }

  return (
    <div className='p-4 space-y-4'>

      <DashboardHeader type='Warehouse' />

      <header className='bg-white p-4'>
        <p className='font-semibold text-lg'>
          Pending Invoices - {pendingInvoices.pagination?.total}
        </p>
      </header>

      <section className='space-y-2'>
        <div className='px-4 py-3 w-full flex justify-between items-center bg-white'>
          <div className='max-w-100 flex gap-4'>
            <SearchComponent placeholder='Search invoice' />
            <Filter />
          </div>

        </div>
        <div className='bg-white  p-4'>

          <div className='space-y-2 md:hidden'>
            <InvoiceCard data={Array.isArray(pendingInvoices.data) ? pendingInvoices.data : []} />
          </div>

          <div className='space-y-2 hidden md:flex'>
            <DataTable data={Array.isArray(pendingInvoices.data) ? pendingInvoices.data : []} columns={pendingInvoiceColumns} />
          </div>
          <Pagination totalPages={pendingInvoices.pagination?.totalPages || 1} />
        </div>
      </section>

      {user.plus &&

        <div className='mt-10 space-y-4'>

          <header className='bg-white p-4'>
            <p className='font-semibold text-lg'>
              Invoices To Check - {InvoicesToCheck.pagination?.total}
            </p>
          </header>

          <section className='space-y-2'>
            <div className='px-4 py-3 w-full flex justify-between items-center bg-white'>
              <div className='max-w-60'>
                <SearchComponent placeholder='Search invoice' />
              </div>

            </div>
            <div className='bg-white  p-4'>
              <DataTable data={Array.isArray(InvoicesToCheck.data) ? InvoicesToCheck.data : []} columns={invoiceColumns} />
              <Pagination totalPages={InvoicesToCheck.pagination?.totalPages || 1} />
            </div>
          </section>
        </div>
      }

      <RefreshOnFocus />

    </div>
  )
}

export default Invoices