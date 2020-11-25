/*
%global dsn;
%let dsn=allnew;
data &dsn;
set WORK.RB_TOTAL_NEWVAR_26W1;
run;
%global ndsn;
%let ndsn=allnew_s;
*/
/*
%global dsn;
%let dsn=yellow;
data &dsn;
set WORK.RB_TOTAL_NEWVAR_26W;
run;
%global ndsn;
%let ndsn=yellow_s;
*/
/*
%global dsn;
%let dsn=allzero;
data &dsn;
set WORK.RB_TOTAL_NEWVAR_26W4;
run;
%global ndsn;
%let ndsn=allzero_s;
*/
/*
%global dsn;
%let dsn=orange;
data &dsn;
set WORK.RB_TOTAL_NEWVAR_26W5;
run;
%global ndsn;
%let ndsn=orange_s;
*/
/*
%global dsn;
%let dsn=cherry;
data &dsn;
set WORK.RB_TOTAL_NEWVAR_26W3;
run;
%global ndsn;
%let ndsn=cherry_s;
*/

%global metric;
%let metric=value;
%global prim;
%let prim=Measures;
%global nid;
%let nid=week;
%global copy;
%let copy='';

%macro stackData(dsn, metric, prim, nid, ndsn, copy);

/*Create a lookup dataset for prim with primary varaible values and record numbers as variable prim_id. The prim_id variable values will then be incorporated into the main dataset 
because when the dataset is transformed, these values will be SAS compliant variable names.*/

/*Sort the data by primary variable.*/
proc sort data=&dsn;
by &prim;
run;
/*Create a lookup dataset for primary using the record number as the id.*/
data lookup;
 set &dsn;
 run;
proc sort data=lookup(keep=&prim) nodupkey;
 by &prim;
 run;
data lookup;
 set lookup;
 length &prim._id 5 &prim._code $8;
 &prim._id = _n_;
 &prim._code = cats('var_',_n_);
 run;

 /*Incorporate the newly created ids into the working dataset.*/
data &dsn;
set &dsn;
 length &prim._id 5 &prim._code $8;
 &prim._id = .;
 &prim._code = '';
proc sql;
 update &dsn as d set &prim._id=(select &prim._id from lookup as l where d.&prim = l.&prim), &prim._code=(select &prim._code from lookup as l where d.&prim = l.&prim);
 quit;


/*Create a lookup table to store the variables chosen to be copied in the &copy macro variable (if they exist) and the primary and prim_id variables 
 so no information is lost. This information will later be incorporated back into the stacked dataset.*/
%macro createLookup(dsn);
%if &copy = '' %then %do;
	data lookup;
 		set &dsn(keep=&prim &prim._id);
	Proc sort data=lookup (keep=&prim &prim._id) nodupkey;
 	by &prim;
	run;
%end;
%else %do;
	data lookup;
 		set &dsn(keep=&prim &prim._id &copy);
	Proc sort data=lookup (keep=&prim &prim._id) nodupkey;
 	by &prim;
	run;
%end;
%mend;
%createLookup(&dsn);

/*Transpose the data naming the _name_ var as the new key &nid.*/
proc transpose data=&dsn(drop=&prim &prim._id) out=&dsn._t(rename=(_name_=&nid));
id &prim._code;
run;

/*Macro getvars obtains a list of variables from a dataset.*/
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

/*Create a new list from vlist to hold the values of the temporary datasets that will be named tmp_&prim._&sec.*/
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
/*start at 2 bc first var is &nid and must be present with each of the other variables.*/
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
        length &prim._id 5;
        &prim._id = scan("&var",2,delim,modif);
        run;

	%let n=%eval(&n+1); 
%end;
%mend;
%stackDatasets(&vlist,&nvar);

data stacked;
set &nlist;
run;

proc sql;
  create table &ndsn as
  select * 
  from stacked, lookup
  where stacked.&prim._id=lookup.&prim._id;
quit;

data &ndsn;
set &ndsn(drop=&prim._id delim modif);
run;

/*END OF STACKDATA MACRO*/
%mend;

/*Call macro stackData and send dataset to be stacked, the dataset metric, primary transpose variable, secondary transpose variable, 
name of new id variable for after transpose, list of variables to be copied to stacked dataset (variables in this list will be lost 
in transpose so must list them to keep them) ,and a name for the final stacked dataset.*/
%stackData(&dsn, &metric, &prim, &nid, &ndsn, &copy);

proc print data=&ndsn;
run;

/*
proc print data=allnew_s;
run;
proc print data=yellow_s;
run;
proc print data=allzero_s;
run;
proc print data=orange_s;
run;
proc print data=cherry_s;
run;