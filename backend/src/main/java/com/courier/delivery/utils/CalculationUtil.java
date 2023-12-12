package com.courier.delivery.utils;


import com.courier.delivery.enums.OrderTypeEnum;

public final class CalculationUtil {
    public final static Double HOUSE_HOLD_RATE = 60d;
    public final static Double OFFICE_RATE = 95d;
    public final static Double RATE_TO_500 = 700d;
    public final static Double RATE_TO_1500 = 2000d;
    public final static Double RATE_TO_2500 = 4500d;

    public static Double calculateRate(Double weight, Double distance, OrderTypeEnum orderType){
        if(OrderTypeEnum.OFFICE.equals(orderType))
            return OFFICE_RATE * weight * distance;
        if(OrderTypeEnum.HOUSEHOLD.equals(orderType))
            return HOUSE_HOLD_RATE * weight * distance;
        if(OrderTypeEnum.OTHER.equals(orderType)){
            if(weight > 0 && weight <=500 )
                return RATE_TO_500 * weight * distance;
            if(weight > 500 && weight <=1500 )
                return (RATE_TO_1500 * (weight - 500) * distance ) + (RATE_TO_500 * 500 * distance);
            if(weight > 1500 && weight <=5500 )
                return RATE_TO_2500 * (weight - 1500) * distance  + (RATE_TO_1500 * 1000 * distance) + (RATE_TO_500 * 500 * distance);
        }
        return RATE_TO_500 * distance * weight/1000;

    }
}
