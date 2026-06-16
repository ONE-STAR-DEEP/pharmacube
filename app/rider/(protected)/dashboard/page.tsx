import { DataTable } from '@/components/Datatable';
import DashboardHeader from '@/components/warehouse/DashboardHeader';
import { fetchPendingInvoicesByRiderID } from '@/lib/actions/rider';
import { acceptedInvoiceColumns } from '@/components/rider/acceptedTableColumn';
import { assignedInvoiceColumns } from '@/components/rider/assignedTableColumn';
import { pickedInvoiceColumns } from '@/components/rider/pickedTableColumn';
import AllActions from '@/components/rider/AllAction';
import { fetchPendingInvoices } from '@/lib/actions/invoice';
import SearchComponent from '@/components/SearchComponent';
import RequestCard from '@/components/rider/RequestCard';


type PageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
};

const Invoices = async ({ searchParams }: PageProps) => {

  const params = await searchParams;

  const search = params?.search

  const pendingInvoices = await fetchPendingInvoices({ Vtyp: "S3", search: search });
  const acceptedInvoices = await fetchPendingInvoicesByRiderID("accepted", search);
  const pickedInvoices = await fetchPendingInvoicesByRiderID("picked", search);

  return (
    <div className='p-4 space-y-4'>
      <DashboardHeader type='Rider' />

      <div>
        <header className='flex flex-col justify-between items-start gap-2 bg-white px-4 py-4'>
          <div className='max-w-60'>
            <SearchComponent placeholder='Search invoice' />
          </div>
        </header>
        <header className='flex flex-col justify-between items-start gap-2 bg-white px-4 pt-4 mt-4'>
          <p className='font-semibold text-lg'>
            Available Delivery - {pendingInvoices?.pagination?.total}
          </p>
        </header>

        <div className='space-y-2 p-2 bg-white'>
          <RequestCard data={Array.isArray(pendingInvoices.data) ? pendingInvoices.data : []} action='accepted' />
        </div>
      </div>

      <div>
        <header className='flex justify-between bg-white px-4 pt-4'>
          <p className='font-semibold text-lg'>
            Accepted for Delivery - {acceptedInvoices.total}
          </p>
          <AllActions action="picked" />
        </header>

        <div className='space-y-2 p-2 bg-white'>
          <RequestCard data={Array.isArray(acceptedInvoices.data) ? acceptedInvoices.data : []} action='picked' />
        </div>
      </div>

      <div className='mb-20'>
        <header className='flex justify-between bg-white px-4 pt-4'>
          <p className='font-semibold text-lg'>
            Picked for Delivery - {pickedInvoices.total}
          </p>
          <AllActions action="delivered" />
        </header>

        <div className='space-y-2 p-2 bg-white'>
          <RequestCard data={Array.isArray(pickedInvoices.data) ? pickedInvoices.data : []} action='delivered' />
        </div>

        {/* <section className='space-y-0'>
          <div className='bg-white  p-4'>
            <DataTable data={Array.isArray(pickedInvoices.data) ? pickedInvoices.data : []} columns={pickedInvoiceColumns} />
          </div>
        </section> */}
      </div>

    </div>
  )
}

export default Invoices