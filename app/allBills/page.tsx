import { getData, getInvoiceItems } from '@/lib/actions/fetchQueries'
import React from 'react'

const AllBills = async () => {

    const data = await getData();

    const items = await getInvoiceItems();
    console.log(data);
    console.log(items);


  return (
    <div>
      <section className='w-full border p-4 items-center justify-between'>
        <h1>All Bills</h1>
        </p>
      </section>
    </div>
  )
}

export default AllBills