import { pendingInvoiceColumns } from '@/components/warehouse/pendingTableColumn';
import { DataTable } from '@/components/Datatable';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent';
import DashboardHeader from '@/components/warehouse/DashboardHeader';
import { RefreshOnFocus } from '@/components/warehouse/pendingRefresh';
import Filter from '@/components/Filter';
import { fetchWarehouseInvoices } from '@/lib/actions/reviewer-checker';
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

  const pendingInvoices = await fetchWarehouseInvoices({ page, limit, search, Vtyp });

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

          <div className='md:hidden space-y-2'>
            <InvoiceCard data={Array.isArray(pendingInvoices.data) ? pendingInvoices.data : []} />
          </div>

          <div className='hidden md:flex'>
            <DataTable data={Array.isArray(pendingInvoices.data) ? pendingInvoices.data : []} columns={pendingInvoiceColumns} />
          </div>
          <Pagination totalPages={pendingInvoices.pagination?.totalPages || 1} />
        </div>
      </section>

      <RefreshOnFocus />

    </div>
  )
}

export default Invoices