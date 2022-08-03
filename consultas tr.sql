-- acima dia 28
SELECT * from tr 
where 
    dt_efetiva BETWEEN '2019-12-02' AND '2020-12-31' AND
    dt_fim <= '2020-12-31' AND
    (
    strftime('%d', dt_efetiva) = strftime('%d', '2020-12-31') OR
    strftime('%d', dt_efetiva) = '01'
    ) AND
    (
    strftime('%d', dt_fim) = strftime('%d', '2020-12-31') OR
    strftime('%d', dt_fim) = '01'
    )
ORDER BY dt_efetiva desc

--ate dia 28
 select * 
        from tr
    where 
        dt_efetiva between '2022-06-01' and '2022-07-10'
        and dt_fim <= '2022-07-10'
        and strftime('%d', dt_efetiva) = strftime('%d', '2022-07-10')
        and strftime('%d', dt_fim) = strftime('%d', '2022-07-10')
    order by dt_efetiva asc
