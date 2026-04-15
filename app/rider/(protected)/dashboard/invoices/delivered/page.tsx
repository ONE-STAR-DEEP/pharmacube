import { invoiceColumns } from '@/components/pendingTableColumn';
import { DataTable } from '@/components/Datatable';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent';
import { fetchDeliveredInvoicesByRiderID } from '@/lib/actions/rider';

type PageProps = {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
    }>;
};

const AcceptedInvoices = async ({ searchParams }: PageProps) => {
    const params = await searchParams;

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 20;

    const search = params?.search

    const status = params?.status

    const data = await fetchDeliveredInvoicesByRiderID(page, limit, search);

    return (
        <div className='p-4 space-y-8'>
            <header className='bg-white p-4'>
                <p className='font-semibold text-lg'>
                    Delivered - {data.pagination?.total}
                </p>
            </header>

            <section className='space-y-2'>
                <div className='px-4 py-3 w-full flex justify-between items-center bg-white'>
                    <div className='max-w-60'>
                        <SearchComponent placeholder='Search invoice' />
                    </div>

                </div>
                <div className='bg-white  p-4'>
                    <DataTable data={Array.isArray(data.data) ? data.data : []} columns={invoiceColumns} />
                    <Pagination totalPages={data.pagination?.totalPages || 1} />
                </div>
            </section>
        </div>
    )
}

export default AcceptedInvoices