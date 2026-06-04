
import UserCard from '@/components/admin/UserCard';
import { userColumns } from '@/components/admin/userTableColumn';
import { DataTable } from '@/components/Datatable';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent';
import ChangePassword from '@/components/user/ChangePassword';
import { fetchUserData } from '@/lib/actions/users'

type PageProps = {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
    }>;
};

const Dashboard = async ({ searchParams }: PageProps) => {
    const params = await searchParams;

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 20;

    const search = params?.search

    const data = await fetchUserData(page, limit, search);

    return (
        <div className='p-4 space-y-8'>
            <header className='bg-white p-4'>
                <p className='font-semibold text-lg'>
                    Users
                </p>
            </header>

            <section className='space-y-2'>
                <div className='px-4 py-3 w-full flex justify-between items-center bg-white'>
                    <div className='max-w-60'>
                        <SearchComponent placeholder='Search user' />
                    </div>
                    <ChangePassword />
                </div>
                <div className='bg-white  p-4'>

                    <div className='hidden md:flex'>
                        <DataTable data={Array.isArray(data.data) ? data.data : []} columns={userColumns} />
                    </div>

                    <div className='space-y-2 md:hidden'>
                        <UserCard data={Array.isArray(data.data) ? data.data : []} />
                    </div>

                    <Pagination totalPages={data.pagination?.totalPages || 1} />
                </div>
            </section>

        </div>
    )
}

export default Dashboard