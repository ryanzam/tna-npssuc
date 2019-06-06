import { DataSource } from '@angular/cdk/table';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MdPaginator, MdSort } from '@angular/material';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { TnaEvent, TnaEventAttendee } from '../../models';
import { DataService } from '../../services/data.service';
import { UserService } from '../../services/user.service';
import { MD_DIALOG_DATA, MdDialog } from '@angular/material';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'tna-events-table',
  templateUrl: './events-table.component.html',
  styleUrls: ['./events-table.component.scss']
})
export class EventsTableComponent implements OnInit, OnDestroy {
  @ViewChild(MdSort) sort: MdSort;
  @ViewChild('filter') filter: ElementRef;
  @ViewChild(MdPaginator) paginator: MdPaginator;

  userProfile: any;
  displayedColumns = ['name', 'no_family', 'no_adults', 'no_children', 'no_vegetarian', 'total', 'has_paid'];
  displayedTitles = ['Name', 'family', 'adults', 'Kids', 'vegetarian', 'total', 'paid'];
  dataSource: CustomDataSource | null;

  eventsWithRegistration = [];
  events = [];
  private _dataSubscription: any;

  data = [];
  eventStatus = {
    adults: 0,
    kids: 0,
    family: 0,
    total: 0
  };

  constructor(private dataService: DataService,
    private userService: UserService,
    public mdDialog: MdDialog) {
  }

  ngOnInit() {
    this.events = this.dataService.events.value;
    this._dataSubscription = this.dataService.attendees.subscribe(res => {
      this.userProfile = this.userService.user.value;
      const data = res.reverse();
      this.eventsWithRegistration = this.events.filter((evt: TnaEvent) => evt['registration'])
        .sort((a, b) => new Date(b.datetime).valueOf() - new Date(a.datetime).valueOf());
      this.data = data;
      this.getEventStatus(this.data);
      this.dataSource = new CustomDataSource({
        data: data,
        dataChange: new BehaviorSubject<any>(data)
      }, this.sort, this.paginator);

      Observable.fromEvent(this.filter.nativeElement, 'keyup')
        .debounceTime(150)
        .distinctUntilChanged()
        .subscribe(() => {
          if (!this.dataSource) { return; }
          this.dataSource.filter = this.filter.nativeElement.value;
          this.data = this.dataSource.filteredData;
          this.getEventStatus(this.data);
        });
    });
  }

  ngOnDestroy() { this._dataSubscription.unsubscribe(); }

  getEventName(owner) {
    const event = this.events.find(event => event.uid === owner);
    return event && event.title ? event.title : '';
  }

  onEventsSelection(value) {
    if (!this.dataSource) { return; }
    this.dataSource.eventFilter = value;
    this.data = this.dataSource.filteredData;
    this.getEventStatus(this.data);
  }

  getEventStatus(data) {
    this.eventStatus.family = 0;
    this.eventStatus.kids = 0;
    this.eventStatus.adults = 0;
    this.eventStatus.total = 0.0;
    data.map(d => {
      this.eventStatus.adults += parseInt(d.no_adults, 10),
        this.eventStatus.family += parseInt(d.no_family, 10),
        this.eventStatus.kids += parseInt(d.no_children, 10),
        this.eventStatus.total += parseFloat(d.total)
    });
  }

  confirmEventPayment(id) {
    const dialogRef = this.mdDialog.open(ConfirmationDialog, {
      data: {
        title: 'Confirm event payment',
        content: 'Confirm if this member has paid for the event?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Ok') {
        this.dataService.confirmEventPayment(id)
          .then(res => console.log(res))
          .catch(err => console.log(err));
      }
    });
  }
}


export class CustomDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  _eventChange = new BehaviorSubject<any>('');
  _filteredData: any = [];

  get filteredData() { return this._filteredData; }

  get filter(): string { return this._filterChange.value; }

  get eventFilter(): string { return this._eventChange.value; }

  set filter(filter: string) { this._filterChange.next(filter); }

  set eventFilter(dates: string) { this._eventChange.next(dates); }

  constructor(private _database, private _sort: MdSort, private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TnaEventAttendee[]> {
    const displayDataChanges = [
      this._database.dataChange,
      this._sort.mdSortChange,
      this._paginator.page,
      this._filterChange,
      this._eventChange
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      // Grab the page's slice of data.
      const data = this._database.data.slice();
      const filterData = this.getFilteredDataByEvent(this.getFilteredData(data));

      this._filteredData = JSON.parse(JSON.stringify(filterData));

      const sortedData = this.getPaginatedData(this.getSortedData(filterData));
      return sortedData;
    });
  }

  disconnect() { }

  /** Returns a filtered copy of the database data. */
  getFilteredDataByEvent(data) {
    if (!this.eventFilter) { return data; }
    return data.filter((item) => {
      return (item.owner).toString().toLowerCase() === this.eventFilter.toString().toLowerCase();
    });
  }

  /** Returns a filtered copy of the database data. */
  getFilteredData(data) {
    return data.filter((item) => {
      const searchStr = (item.name ||  '').toLowerCase();
      return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
    });
  }

  /** Returns a paginated copy of the database data. */
  getPaginatedData(data): TnaEventAttendee[] {
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    return data.splice(startIndex, this._paginator.pageSize);
  }

  /** Returns a sorted copy of the database data. */
  getSortedData(data): TnaEventAttendee[] {
    if (!this._sort.active || this._sort.direction === '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'name':
          [propertyA, propertyB] = [a.name, b.name];
          break;
        case 'no_family':
          [propertyA, propertyB] = [a.no_family, b.no_family];
          break;
        case 'no_adults':
          [propertyA, propertyB] = [a.no_adults, b.no_adults];
          break;
        case 'no_children':
          [propertyA, propertyB] = [a.no_children, b.no_children];
          break;
        case 'no_vegetarian':
          [propertyA, propertyB] = [a.no_vegetarian, b.no_vegetarian];
          break;
        case 'has_paid':
          [propertyA, propertyB] = [a.has_paid, b.has_paid];
          break;
        case 'total':
          [propertyA, propertyB] = [a.total, b.total];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}
