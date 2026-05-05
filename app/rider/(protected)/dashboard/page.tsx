import { DataTable } from '@/components/Datatable';
import DashboardHeader from '@/components/warehouse/DashboardHeader';
import { fetchPendingInvoicesByRiderID } from '@/lib/actions/rider';
import { acceptedInvoiceColumns } from '@/components/rider/acceptedTableColumn';
import { assignedInvoiceColumns } from '@/components/rider/assignedTableColumn';
import { pickedInvoiceColumns } from '@/components/rider/pickedTableColumn';
import AllActions from '@/components/rider/AllAction';
import { fetchPendingInvoices } from '@/lib/actions/invoice';

const Invoices = async () => {

  const pendingInvoices = await fetchPendingInvoices();
  const acceptedInvoices = await fetchPendingInvoicesByRiderID("accepted");
  const pickedInvoices = await fetchPendingInvoicesByRiderID("picked");

  return (
    <div className='p-4 space-y-4'>
      <DashboardHeader type='Rider' />

      <div>
        <header className='flex justify-between items-center bg-white px-4 pt-4'>
          <p className='font-semibold text-lg'>
            Available Delivery - {pendingInvoices?.pagination?.total}
          </p>
        </header>

        <section className='space-y-0'>
          <div className='bg-white  p-4'>
            <DataTable data={Array.isArray(pendingInvoices.data) ? pendingInvoices.data : []} columns={assignedInvoiceColumns} />
            {/* <Pagination totalPages={pendingInvoices.pagination?.totalPages || 1} /> */}
          </div>
        </section>
      </div>

      <div>
        <header className='flex justify-between bg-white px-4 pt-4'>
          <p className='font-semibold text-lg'>
            Accepted for Delivery - {acceptedInvoices.total}
          </p>
          <AllActions action="picked" />
        </header>

        <section className='space-y-0'>
          <div className='bg-white  p-4'>
            <DataTable data={Array.isArray(acceptedInvoices.data) ? acceptedInvoices.data : []} columns={acceptedInvoiceColumns} />
            {/* <Pagination totalPages={acceptedInvoices.pagination?.totalPages || 1} /> */}
          </div>
        </section>
      </div>

      <div>
        <header className='flex justify-between bg-white px-4 pt-4'>
          <p className='font-semibold text-lg'>
            Picked for Delivery - {pickedInvoices.total}
          </p>
          <AllActions action="delivered" />
        </header>

        <section className='space-y-0'>
          <div className='bg-white  p-4'>
            <DataTable data={Array.isArray(pickedInvoices.data) ? pickedInvoices.data : []} columns={pickedInvoiceColumns} />
            {/* <Pagination totalPages={pickedInvoices.pagination?.totalPages || 1} /> */}
          </div>
        </section>
      </div>

    </div>
  )
}

export default Invoices