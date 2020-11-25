
/*
%global dsn;
%let dsn=data1;
data &dsn;
set WORK.DATA1;
run;
%global ndsn;
%let ndsn=data1_s;

%global metric;
%let metric=value;
%global key;
%let key=Measures;
%global nid;
%let nid=week;
%global copy;
%let copy='';

%macro stackData(dsn, metric, key, nid, ndsn, copy);

/*Create a lookup dataset for the key variable values and "var_"plus the record number as variable key_id. The key_id variable values will then be incorporated  
into the main dataset so that, when the dataset is transformed, these values, "var_r", where r is the record 
number, will be SAS compliant variable names.*/

/*Sort the data by key variable.*/
proc sort data=&dsn;
by &key;
run;
/*Create a lookup dataset for the key using the record number as the id.*/
data lookup;
 set &dsn;
 run;
proc sort data=lookup(keep=&key) nodupkey;
 by &key;
 run;
data lookup;
 set lookup;
 length &key._id 5 &key._code $8;
 &key._id = _n_;
 &key._code = cats('var_',_n_);
 run;

 /*Incorporate the newly created ids into the working dataset.*/
data &dsn;
set &dsn;
 length &key._id 5 &key._code $8;
 &key._id = .;
 &key._code = '';
proc sql;
 update &dsn as d set &key._id=(select &key._id from lookup as l where d.&key = l.&key), &key._code=(select &key._code from lookup as l where d.&key = l.&key);
 quit;

/*Create a lookup table to store the variables chosen to be copied in the &copy variable (if they exist) and the key and  
 key_id variables so no information is lost. This information will later be incorporated back into the stacked dataset.*/
%macro createLookup(dsn);
%if &copy = '' %then %do;
	data lookup;
 		set &dsn(keep=&key &key._id);
	Proc sort data=lookup (keep=&key &key._id) nodupkey;
 	by &key;
	run;
%end;
%else %do;
	data lookup;
 		set &dsn(keep=&key &key._id &copy);
	Proc sort data=lookup (keep=&key &key._id) nodupkey;
 	by &key;
	run;
%end;
%mend;
%createLookup(&dsn);

/*Transpose the data naming the _name_ var as the new key &nid.*/
%macro transposeDSN(dsn);
%if &copy = '' %then %do;
	proc transpose data=&dsn(drop=&key &key._id) out=&dsn._t(rename=(_name_=&nid));
	id &key._code;
	run;
%end;
%else %do;
	proc transpose data=&dsn(drop=&key &key._id &copy) out=&dsn._t(rename=(_name_=&nid));
	id &key._code;
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

/*Create a new list from vlist to hold the values of the temporary datasets that will be named tmp_&key.*/
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
%let nlist=%SYSFUNC(COMPRESS(&nlist.,%str(%')));
%put &nlist;

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
        length &key._id 5;
        &key._id = scan("&var",2,delim,modif);
        run;

	%let n=%eval(&n+1); 
%end;
%mend;
%stackDatasets(&vlist,&nvar);

/*Combine the newly created datasets into one stacked dataset.*/
data stacked;
set &nlist;
run;

/*Match the id variable from the lookup table to the new stacked dataset and incorporate the original key and the 
copy variables into the final stacked dataset.*/
proc sql;
  create table &ndsn as
  select * 
  from stacked, lookup
  where stacked.&key._id=lookup.&key._id;
quit;

/*Eliminate the working variables &key._id, delim, and modif.*/
data &ndsn;
set &ndsn(drop=&key._id delim modif);
run;

/*END OF STACKDATA MACRO*/
%mend;

/*Call macro stackData with the following parameters: the dataset to be stacked, the dataset metric, key transpose variable, the
name of new id variable for after transpose, list of variables to be copied to stacked dataset (variables in this list will be lost 
in transpose so they must be listed to keep them), and a name for the final stacked dataset.*/
%stackData(&dsn, &metric, &key, &nid, &ndsn, &copy);

proc print data=&ndsn;
run;