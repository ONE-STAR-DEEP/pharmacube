import { invoiceColumns } from '@/components/admin/invoiceTableColumn';
import { DataTable } from '@/components/Datatable';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent';
import Filter from '@/components/Filter';
import { fetchAttendedInvoices } from '@/lib/actions/reviewer-checker';
import InvoiceCard from '@/components/admin/InvoiceCard';
import StatusFilter from '@/components/StatusFilter';
import DateFilter from '@/components/DateFilter';

type PageProps = {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        status?: number;
        Vtyp?: string;
        startDate?: string;
        endDate?: string;
    }>;
};

const Invoices = async ({ searchParams }: PageProps) => {
    const params = await searchParams;

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 20;

    const search = params?.search

    const status = params?.status
    const startDate = params?.startDate
    const endDate = params?.endDate
    const Vtyp = params?.Vtyp

    const data = await fetchAttendedInvoices(page, limit, search, Vtyp, status, startDate, endDate);

    return (
        <div className='p-4 space-y-8'>
            <header className='bg-white p-4'>
                <p className='font-semibold text-lg'>
                    Invoices - {data.pagination?.total}
                </p>
            </header>

            <section className='space-y-2'>
                <div className='px-4 py-3 w-full flex flex-col gap-2 md:flex-row md:justify-between md:items-center bg-white'>
                    <div className='max-w-100 flex gap-4'>
                        <SearchComponent placeholder='Search invoice' />
                        <Filter />
                    </div>
                    <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-2'>
                            <span className='text-sm ml-1 font-semibold'>Status</span>
                            <StatusFilter />
                        </div>
                        <DateFilter />
                    </div>
                </div>

                <div className='bg-white p-4'>

                    <div className='md:hidden space-y-2'>
                        <InvoiceCard data={Array.isArray(data.data) ? data.data : []} />
                    </div>

                    <div className='hidden md:flex'>
                        <DataTable data={Array.isArray(data.data) ? data.data : []} columns={invoiceColumns} />
                    </div>
                    <Pagination totalPages={data.pagination?.totalPages || 1} />
                </div>

            </section>
        </div>
    )
}

export default Invoices