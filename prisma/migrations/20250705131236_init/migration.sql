-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_Productid_fkey" FOREIGN KEY ("Productid") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
