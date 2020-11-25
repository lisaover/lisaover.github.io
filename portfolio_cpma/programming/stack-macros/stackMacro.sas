%global dsn;
%let dsn=PriceData;
%global metric;
%let metric=price;
%global comp1;
%let comp1=brand;
%global comp2;
%let comp2=store;
%global nid;
%let nid=date;
%global copy;
%let copy=selected category state;
%global ndsn;
%let ndsn=Price;

%global PriceDataName;
%let PriceDataName=DATA1;
data &dsn;
set &PriceDataName;
run;
proc print data=&dsn;
run;



%macro stackData(dsn, metric, comp1, comp2, nid, copy, ndsn);

/*Create two lookup datasets: (1) comp1_lookup with component key 1 variable values and "var_" plus record number as new variable comp1_id and 
(2) comp2_lookup with component key 2 variable values and "_" plus record number as new variable comp2_id. The comp1_id and comp2_id variable 
values will then be incorporated into the main dataset so that, when the dataset is transformed, these values, "var_r_r", where r is the record 
number, will be SAS compliant variable names.*/

/*Sort the data by component key 1 variable.*/
proc sort data=&dsn;
by &comp1;
run;
/*Create a lookup dataset for component key 1 using the record number as the id.*/
data comp1_lookup;
 set &dsn;
 run;
proc sort data=comp1_lookup(keep=&comp1) nodupkey;
 by &comp1;
 run;
data comp1_lookup;
 set comp1_lookup;
 length &comp1._id 5 &comp1._code $8;
 &comp1._id = _n_;
 &comp1._code = cats('var_',_n_);

/*Sort the data by component key 2 variable.*/
proc sort data=&dsn;
by &comp2;
run;
/*Create a lookup dataset for component key 2 using the record number as the id.*/
data comp2_lookup;
 set &dsn;
 run;
proc sort data=comp2_lookup(keep=&comp2) nodupkey;
 by &comp2;
 run;
data comp2_lookup;
 set comp2_lookup;
 length &comp2._id 5 &comp2._code $5;
 &comp2._id = _n_;
 &comp2._code = cats('_',_n_);
 run;

 /*Incorporate the newly created ids into the working dataset.*/
data &dsn;
set &dsn;
 length &comp1._id 5 &comp1._code $8 &comp2._id 5 &comp2._code $5;
 &comp1._id = .;
 &comp1._code = '';
 &comp2._id = .;
 &comp2._code = '';
proc sql;
 update &dsn as d set &comp1._id=(select &comp1._id from comp1_lookup as p where d.&comp1 = p.&comp1), &comp1._code=(select &comp1._code from comp1_lookup as p where d.&comp1 = p.&comp1) , &comp2._id=(select &comp2._id from comp2_lookup as s where d.&comp2 = s.&comp2), &comp2._code=(select &comp2._code from comp2_lookup as s where d.&comp2 = s.&comp2);
 quit;


/*Create a final lookup table to store the variables chosen to be copied in the &copy variable, the component key 1 and component key 2 variables, 
 and the comp1_id and comp2_id variables so no information is lost. This information will later be incorporated back into the stacked dataset.*/
%macro createLookup(dsn);
%if &copy = '' %then %do;
	data lookup;
 		set &dsn(keep=&comp1 &comp2 &comp1._id &comp2._id);
	Proc sort data=lookup (keep=&comp1 &comp2 &comp1._id &comp2._id) nodupkey;
 	by &comp1 &comp2;
	run;
%end;
%else %do;
	data lookup;
 		set &dsn(keep=&comp1 &comp2 &comp1._id &comp2._id &copy);
	Proc sort data=lookup (keep=&comp1 &comp2 &comp1._id &comp2._id &copy) nodupkey;
 	by &comp1 &comp2;
	run;
%end;
%mend;
%createLookup(&dsn);

/*Transpose the data naming the _name_ var as the new key &nid.*/
%macro transposeDSN(dsn);
%if &copy = '' %then %do;
	proc transpose data=&dsn(drop=&comp1 &comp2 &comp1._id &comp2._id) out=&dsn._t(rename=(_name_=&nid));
	id &comp1._code &comp2._code;
	run;
%end;
%else %do;
	proc transpose data=&dsn(drop=&comp1 &comp2 &comp1._id &comp2._id &copy) out=&dsn._t(rename=(_name_=&nid));
	id &comp1._code &comp2._code;
	run;
%end;
%mend;
%transposeDSN(&dsn);

/*Macro getvars obtains a list of variables from the transposed dataset.*/
%macro getvars(dsn);
%global vlist;
%global nvar;
%let nvar=%sysfunc(attrn(%sysfunc(open(work.&dsn,i)),nvars));
proc sql;
select name into :vlist separated by ' '
from dictionary.columns
where memname=upcase("&dsn");
quit;
%mend;
%getvars(&dsn._t); 
%put &vlist;
%put &nvar;

/*Create a new list from vlist to hold the values of the temporary datasets that will be named tmp_&comp1._&comp2.*/
%macro createNewList(str, len);
%let n=2;
%let delim=' ';
%let modif=mo;
%global nlist;
%let nlist='';
%do %while (&n <= &len);
	%let var = %SYSFUNC(cats(tmp_,%scan(&str,&n,&delim,&modif)));
	%let nlist = %SYSFUNC(catx(%str( ),&nlist,&var));
	/*The following blocked out code was supposed to eliminate the initialization of nlist with single quotes
	and the need to compress nlist to eliminate the initial single quotes later. It does not work though.*/
	/*
	%if &n = 2 %then %let nlist = &var
	%else %let nlist = %SYSFUNC(catx(%str( ),&nlist,&var));
	*/
%let n=%eval(&n+1); 
%end;
%mend;
%createNewList(&vlist,&nvar);
/*Compress nlist to eliminate the single quotes at the beginning.*/
%let nlist=%SYSFUNC(COMPRESS(&nlist.,%str(%')));
%put &nlist;

/*The stackDatasets macro takes the first variable in vlist, &nid, and matches it with each of the remaining variables to 
create multiple datasets named tmp_&comp1._&comp2.*/
%macro stackDatasets(str,len);
/*start at 2 because the first var is &nid and must be present with each of the other variables.*/
%let n=2;
%let delim=' ';
%let modif=mo;
%do %while (&n <= &len);
	%let var = %scan(&str,&n,&delim,&modif);
	%let dset = %sysfunc(cats(tmp_,&var));
		data &dset;
        set &dsn._t(keep=&nid &var rename=(&var=&metric));
        delim='_';
        modif='o';
        length &comp1._id 5 &comp2._id 5;
        &comp1._id = scan("&var",2,delim,modif);
        &comp2._id = scan("&var",3,delim,modif);
        run;

	%let n=%eval(&n+1); 
%end;
%mend;
%stackDatasets(&vlist,&nvar);

/*Combine the newly created datasets into one stacked dataset.*/
data stacked;
set &nlist;

/*Match the id variables from the lookup table to the new stacked dataset and incorporate both original component keys 
and the copy variables into the final stacked dataset.*/
proc sql;
  create table &ndsn as
  select * 
  from stacked, lookup
  where stacked.&comp1._id=lookup.&comp1._id AND stacked.&comp2._id=lookup.&comp2._id;
quit;

/*Eliminate the working variables &comp1._id, &comp2._id,  delim, and modif.*/
data &ndsn;
set &ndsn(drop=&comp1._id &comp2._id  delim modif);
run;

/*END OF STACKDATA MACRO*/
%mend;

/*Call macro stackData with the following parameters: the dataset to be stacked, the dataset metric, component key 1 transpose variable, 
component key 2 transpose variable, name of new id variable for after transpose, list of variables to be copied to stacked dataset 
(variables in this list will be lost in transpose so they must be listed to keep them), and a name for the final stacked dataset.*/
%stackData(&dsn, &metric, &comp1, &comp2, &nid, &copy, &ndsn);

proc print data=&ndsn;
run;