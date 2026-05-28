import { invoiceColumns } from '@/components/rider/deliveryTable';
import { DataTable } from '@/components/Datatable';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent';
import DashboardHeader from '@/components/warehouse/DashboardHeader';
import { fetchPendingDeliveryByRiderID } from '@/lib/actions/rider';
import DeliveryCard from '@/components/rider/DeliveryCard';

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

  const data = await fetchPendingDeliveryByRiderID(page, limit, search);

  return (
    <div className='p-4 space-y-4'>

      <DashboardHeader type='Delivery' />

      <header className='bg-white p-4'>
        <p className='font-semibold text-lg'>
          Pending Delivery - {data.pagination?.total}
        </p>
      </header>

      <section className='space-y-2 mb-20'>
        <div className='px-4 py-3 w-full flex justify-between items-center bg-white'>
          <div className='max-w-60'>
            <SearchComponent placeholder='Search invoice' />
          </div>
        </div>

        <div className='space-y-2 p-2 bg-white'>
          <DeliveryCard data={Array.isArray(data.data) ? data.data : []} />
        </div>
        {/* <div className='bg-white  p-4'>
          <DataTable data={Array.isArray(data.data) ? data.data : []} columns={invoiceColumns} />
          </div> */}
        <Pagination totalPages={data.pagination?.totalPages || 1} />
      </section>

    </div>
  )
}

export default Invoices