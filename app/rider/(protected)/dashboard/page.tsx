import { invoiceColumns } from '@/components/rider/requestTable';
import { DataTable } from '@/components/Datatable';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent';
import { fetchPendingInvoices } from '@/lib/actions/invoice';
import { RefreshOnMount } from '@/components/warehouse/pendingRefresh';
import DashboardHeader from '@/components/warehouse/DashboardHeader';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  }>;
};

const Invoices = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 20;

  const search = params?.search

  const status = params?.status

  const data = await fetchPendingInvoices(page, limit, search);

  return (
    <div className='p-4 space-y-4'>

      <DashboardHeader type='Rider'/>

      <header className='bg-white p-4'>
        <p className='font-semibold text-lg'>
          Assigned Delivery - {data.pagination?.total}
        </p>
      </header>

      <section className='space-y-2'>
       
        <div className='bg-white  p-4'>
          <DataTable data={Array.isArray(data.data) ? data.data : []} columns={invoiceColumns} />
          <Pagination totalPages={data.pagination?.totalPages || 1} />
        </div>
      </section>
      <RefreshOnMount />

    </div>
  )
}

export default Invoices